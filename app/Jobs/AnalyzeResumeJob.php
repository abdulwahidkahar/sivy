<?php

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

class AnalyzeResumeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public Analysis $analysis)
    {
    }

    public function handle(): void
    {
        $this->analysis->load(['resume', 'role']);

        if (!$this->analysis->resume || !$this->analysis->role) {
            $this->fail(new Exception("Analysis record [ID: {$this->analysis->id}] is missing resume or role relation."));
            return;
        }

        $this->analysis->update(['status' => 'processing']);

        try {
            $apiKey = config('services.gemini.api_key');
            if (empty($apiKey)) {
                throw new Exception('Gemini API key not found.');
            }

            $text = $this->extractTextFromFile();
            if (empty($text)) {
                throw new Exception('Failed to extract text from PDF.');
            }

            $analysisResult = $this->getAnalysisFromAi($text, $apiKey);

            $sanitizedResult = $this->sanitizeUtf8($analysisResult);

            $this->analysis->update([
                'status' => 'completed',
                'technical_score' => $sanitizedResult['technical_score'] ?? null,
                'culture_score' => $sanitizedResult['culture_score'] ?? null,
                'summary' => $sanitizedResult['summary'] ?? null,
                'justification' => $sanitizedResult['justification'] ?? null,
                'raw_result' => $sanitizedResult,
            ]);

            $this->syncSkills($sanitizedResult['skills'] ?? []);

        } catch (Exception $e) {
            $this->analysis->update(['status' => 'failed']);
            Log::error("Analysis failed [Analysis ID: {$this->analysis->id}]: " . $e->getMessage());
            $this->fail($e);
        }
    }

    private function extractTextFromFile(): string
    {
        $filePath = Storage::disk('public')->path($this->analysis->resume->storage_path);
        $rawText = (new Parser())->parseFile($filePath)->getText();
        // Membersihkan teks dari karakter yang tidak valid saat ekstraksi
        return $this->sanitizeString($rawText);
    }

    private function getAnalysisFromAi(string $text, string $apiKey): array
    {
        $role = $this->analysis->role;

        $prompt = "Anda adalah seorang asisten rekrutmen AI yang sangat teliti. Berdasarkan teks CV berikut, analisis kecocokannya untuk posisi '{$role->name}'.
        Kualifikasi teknis yang dicari adalah: '{$role->requirement}'.
        Kualifikasi budaya yang dicari adalah: '{$role->culture}'.

        Berikan jawaban HANYA dalam format JSON yang valid dan **gunakan Bahasa Indonesia** untuk semua nilai string di dalam JSON. JSON harus berisi kunci berikut:
        - 'technical_score' (integer 0-100, berdasarkan kualifikasi teknis)
        - 'culture_score' (integer 0-100, berdasarkan kualifikasi budaya)
        - 'summary' (string, 2-3 kalimat ringkasan profesional kandidat dalam Bahasa Indonesia)
        - 'skills' (array of strings, daftar keahlian yang relevan)
        - 'justification' (object dengan kunci 'positive_points' dan 'negative_points', keduanya adalah array of strings dalam Bahasa Indonesia)

        Teks CV: \n\n{$text}";

        $response = Http::timeout(120)->post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}",
            [
                'contents' => [['parts' => [['text' => $prompt]]]],
                'generationConfig' => [
                    'response_mime_type' => 'application/json',
                ],
            ]
        );

        if (!$response->successful()) {
            throw new Exception('Gemini API error: ' . $response->body());
        }

        $result = $response->json('candidates.0.content.parts.0.text');

        if (empty($result) || !is_array($result)) {
            $decoded = json_decode($result, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
            throw new Exception('Invalid JSON response from Gemini API: ' . $response->body());
        }

        return $result;
    }

    private function syncSkills(array $skillNames): void
    {
        $skillIds = [];
        foreach ($skillNames as $skillName) {
            $skill = Skill::firstOrCreate(['name' => trim($skillName)]);
            $skillIds[] = $skill->id;
        }

        if (!empty($skillIds)) {
            $this->analysis->skills()->sync($skillIds);
        }
    }

    /**
     * Membersihkan string dari karakter UTF-8 yang tidak valid.
     */
    private function sanitizeString(string $string): string
    {
        // Trik ini akan mengganti karakter UTF-8 yang tidak valid dengan karakter pengganti (�)
        // yang aman untuk di-encode ke JSON.
        return json_decode(json_encode($string, JSON_INVALID_UTF8_SUBSTITUTE));
    }

    /**
     * Membersihkan data secara rekursif dari karakter UTF-8 yang tidak valid.
     */
    private function sanitizeUtf8($data)
    {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = $this->sanitizeUtf8($value);
            }
        } elseif (is_string($data)) {
            return $this->sanitizeString($data);
        }
        return $data;
    }
}
