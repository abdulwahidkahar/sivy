<?php

namespace App\Jobs;

use App\Models\Resume;
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

    public function __construct(public Resume $resume) {}

    public function handle(): void
    {
        $this->resume->update(['status' => 'processing']);

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

            $this->resume->update([
                'status' => 'completed',
                'analysis_result' => $analysisResult,
            ]);
        } catch (Exception $e) {
            $this->resume->update(['status' => 'failed']);
            Log::error("Resume analysis failed [ID: {$this->resume->id}]: " . $e->getMessage());
            $this->fail($e);
        }
    }

    private function extractTextFromFile(): string
    {
        $filePath = Storage::disk('public')->path($this->resume->storage_path);
        return (new Parser())->parseFile($filePath)->getText();
    }

    private function getAnalysisFromAi(string $text, string $apiKey): array
    {
        $prompt = "Anda adalah seorang asisten HRD ahli. Berdasarkan teks CV berikut, ekstrak informasi dalam format JSON yang valid. JSON harus berisi kunci berikut: 'nama_kandidat' (string), 'skor_kecocokan' (integer 0-100 berdasarkan relevansi untuk posisi software engineer), 'ringkasan' (string, 2-3 kalimat), dan 'skills' (array of strings). Pastikan respons HANYA berisi JSON, tanpa teks tambahan. Teks CV: \n\n{$text}";

        $response = Http::timeout(90)->post(
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

        $result = $response->json();

        if (empty($result) || !is_array($result)) {
            throw new Exception('Invalid response from Gemini API: ' . $response->body());
        }

        return $result;
    }
}
