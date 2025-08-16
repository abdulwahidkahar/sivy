<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Analysis;
use App\Models\Skill;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser;
use Throwable;

class AnalyzeResumeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 300;

    /**
     * Create a new job instance.
     */
    public function __construct(public Analysis $analysis)
    {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $this->analysis->load(['resume', 'role']);

            if (!$this->analysis->resume || !$this->analysis->role) {
                throw new Exception("Analysis record [ID: {$this->analysis->id}] is missing resume or role relation.");
            }

            $this->analysis->markAsProcessing();

            $apiKey = config('services.gemini.api_key');
            if (empty($apiKey)) {
                throw new Exception('Gemini API key not configured.');
            }

            $text = $this->extractTextFromFile();
            if (empty($text)) {
                throw new Exception('Failed to extract text from PDF file.');
            }

            $analysisResult = $this->getAnalysisFromAi($text, $apiKey);
            if (empty($analysisResult)) {
                throw new Exception('AI analysis returned empty result.');
            }

            $sanitizedResult = $this->sanitizeUtf8($analysisResult);

            $this->analysis->update([
                'status' => Analysis::STATUS_COMPLETED,
                'technical_score' => $sanitizedResult['technical_score'] ?? null,
                'culture_score' => $sanitizedResult['culture_score'] ?? null,
                'summary' => $sanitizedResult['summary'] ?? null,
                'justification' => $sanitizedResult['justification'] ?? null,
                'raw_result' => $sanitizedResult,
            ]);

            $this->syncSkills($sanitizedResult['skills'] ?? []);

            Log::info("Analysis completed successfully [Analysis ID: {$this->analysis->id}]");

        } catch (Throwable $e) {
            $this->handleJobFailure($e);
        }
    }

    /**
     * Handle job failure with proper logging and status update.
     */
    private function handleJobFailure(Throwable $e): void
    {
        $this->analysis->markAsFailed();
        
        Log::error("Analysis failed [Analysis ID: {$this->analysis->id}]", [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'resume_id' => $this->analysis->resume_id,
            'role_id' => $this->analysis->role_id,
        ]);
        
        $this->fail($e);
    }

    /**
     * Extract text from PDF file.
     */
    private function extractTextFromFile(): string
    {
        $storagePath = $this->analysis->resume->storage_path;
        if (empty($storagePath)) {
            throw new Exception('Resume storage path is empty.');
        }

        $filePath = Storage::disk('public')->path($storagePath);
        if (!file_exists($filePath)) {
            throw new Exception("Resume file not found at path: {$filePath}");
        }

        try {
            $parser = new Parser();
            $pdf = $parser->parseFile($filePath);
            $rawText = $pdf->getText();
            
            if (empty(trim($rawText))) {
                throw new Exception('PDF file appears to be empty or unreadable.');
            }
            
            return $this->sanitizeString($rawText);
        } catch (Exception $e) {
            throw new Exception("Failed to parse PDF file: {$e->getMessage()}");
        }
    }

    /**
     * Get analysis result from AI service.
     */
    private function getAnalysisFromAi(string $text, string $apiKey): array
    {
        $role = $this->analysis->role;

        $prompt = $this->buildAnalysisPrompt($role->name, $role->requirement, $role->culture, $text);

        try {
            $response = Http::timeout(120)
                ->retry(2, 1000)
                ->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}",
                    [
                        'contents' => [['parts' => [['text' => $prompt]]]],
                        'generationConfig' => [
                            'response_mime_type' => 'application/json',
                            'temperature' => 0.1,
                        ],
                    ]
                );

            if (!$response->successful()) {
                throw new Exception("Gemini API error [{$response->status()}]: {$response->body()}");
            }

            $result = $response->json('candidates.0.content.parts.0.text');

            if (empty($result)) {
                throw new Exception('Empty response from Gemini API.');
            }

            // Handle both string and array responses
            if (is_string($result)) {
                $decoded = json_decode($result, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new Exception('Invalid JSON response from Gemini API: ' . json_last_error_msg());
                }
                $result = $decoded;
            }

            if (!is_array($result)) {
                throw new Exception('Gemini API response is not a valid array.');
            }

            return $this->validateAnalysisResult($result);

        } catch (Exception $e) {
            throw new Exception("AI analysis failed: {$e->getMessage()}");
        }
    }

    /**
     * Build the analysis prompt for AI.
     */
    private function buildAnalysisPrompt(string $roleName, string $requirement, string $culture, string $text): string
    {
        return "Anda adalah seorang asisten rekrutmen AI yang sangat teliti. Berdasarkan teks CV berikut, analisis kecocokannya untuk posisi '{$roleName}'.
        Kualifikasi teknis yang dicari adalah: '{$requirement}'.
        Kualifikasi budaya yang dicari adalah: '{$culture}'.

        Berikan jawaban HANYA dalam format JSON yang valid dan **gunakan Bahasa Indonesia** untuk semua nilai string di dalam JSON. JSON harus berisi kunci berikut:
        - 'nama_kandidat' (string, nama lengkap kandidat dari CV)
        - 'technical_score' (integer 0-100, berdasarkan kualifikasi teknis)
        - 'culture_score' (integer 0-100, berdasarkan kualifikasi budaya)
        - 'summary' (string, 2-3 kalimat ringkasan profesional kandidat dalam Bahasa Indonesia)
        - 'skills' (array of strings, daftar keahlian yang relevan)
        - 'justification' (object dengan kunci 'positive_points' dan 'negative_points', keduanya adalah array of strings dalam Bahasa Indonesia)

        Teks CV: \n\n{$text}";
    }

    /**
     * Validate the analysis result from AI.
     */
    private function validateAnalysisResult(array $result): array
    {
        $requiredKeys = ['nama_kandidat', 'technical_score', 'culture_score', 'summary', 'skills', 'justification'];
        
        foreach ($requiredKeys as $key) {
            if (!array_key_exists($key, $result)) {
                throw new Exception("Missing required key '{$key}' in AI response.");
            }
        }

        // Validate score ranges
        if (!is_int($result['technical_score']) || $result['technical_score'] < 0 || $result['technical_score'] > 100) {
            throw new Exception('Invalid technical_score: must be integer between 0-100.');
        }

        if (!is_int($result['culture_score']) || $result['culture_score'] < 0 || $result['culture_score'] > 100) {
             throw new Exception('Invalid culture_score: must be integer between 0-100.');
         }

         return $result;
     }

    /**
     * Sync skills with the analysis.
     */
    private function syncSkills(array $skillNames): void
    {
        if (empty($skillNames)) {
            return;
        }

        $skillIds = [];
        foreach ($skillNames as $skillName) {
            if (!is_string($skillName) || empty(trim($skillName))) {
                continue;
            }

            $cleanSkillName = trim($skillName);
            if (strlen($cleanSkillName) > 255) {
                $cleanSkillName = substr($cleanSkillName, 0, 255);
            }

            try {
                $skill = Skill::firstOrCreate(['name' => $cleanSkillName]);
                $skillIds[] = $skill->id;
            } catch (Exception $e) {
                Log::warning("Failed to create/find skill: {$cleanSkillName}", ['error' => $e->getMessage()]);
            }
        }

        if (!empty($skillIds)) {
            $this->analysis->skills()->sync($skillIds);
        }
    }

    /**
     * Clean string from invalid UTF-8 characters.
     */
    private function sanitizeString(string $string): string
    {
        // Replace invalid UTF-8 characters with replacement character
        $cleaned = mb_convert_encoding($string, 'UTF-8', 'UTF-8');
        
        // Additional cleanup for JSON safety
        return json_decode(json_encode($cleaned, JSON_INVALID_UTF8_SUBSTITUTE | JSON_UNESCAPED_UNICODE), true) ?? '';
    }

    /**
     * Recursively clean data from invalid UTF-8 characters.
     */
    private function sanitizeUtf8(mixed $data): mixed
    {
        if (is_array($data)) {
            $sanitized = [];
            foreach ($data as $key => $value) {
                $sanitizedKey = is_string($key) ? $this->sanitizeString($key) : $key;
                $sanitized[$sanitizedKey] = $this->sanitizeUtf8($value);
            }
            return $sanitized;
        }
        
        if (is_string($data)) {
            return $this->sanitizeString($data);
        }
        
        return $data;
    }
}
