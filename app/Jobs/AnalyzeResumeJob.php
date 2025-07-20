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
use Smalot\PdfParser\Parser; // PERUBAHAN: Gunakan Parser baru

class AnalyzeResumeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public Resume $resume)
    {
        //
    }

    public function handle(): void
    {
        $this->resume->update(['status' => 'processing']);
        Log::info("Memulai analisis untuk resume ID: {$this->resume->id}");

        try {
            $apiKey = config('services.gemini.api_key');
            if (!$apiKey) {
                throw new Exception('GEMINI_API_KEY tidak ditemukan di file .env');
            }

            // Panggil fungsi extractTextFromFile yang sudah diubah
            $text = $this->extractTextFromFile();
            if (empty($text)) {
                throw new Exception('Gagal mengekstrak teks dari file atau file kosong.');
            }

            $analysisResult = $this->getAnalysisFromAi($text, $apiKey);

            $this->resume->update([
                'status' => 'completed',
                'analysis_result' => $analysisResult,
            ]);

            Log::info("Analisis untuk resume ID: {$this->resume->id} berhasil.");

        } catch (Exception $e) {
            $this->resume->update(['status' => 'failed']);
            Log::error("Gagal menganalisis resume ID: {$this->resume->id}. Error: " . $e->getMessage());
            $this->fail($e);
        }
    }

    /**
     * PERUBAHAN UTAMA DI SINI
     * Menggunakan smalot/pdfparser untuk mengekstrak teks.
     */
    private function extractTextFromFile(): string
    {
        $filePath = Storage::disk('public')->path($this->resume->storage_path);

        // Inisialisasi Parser baru
        $parser = new Parser();

        // Parse file PDF
        $pdf = $parser->parseFile($filePath);

        // Ambil semua teks dari PDF
        return $pdf->getText();
    }

    /**
     * Fungsi ini tidak perlu diubah
     */
    private function getAnalysisFromAi(string $text, string $apiKey): array
    {
        $prompt = "Anda adalah seorang asisten HRD ahli. Berdasarkan teks CV berikut, ekstrak informasi dalam format JSON yang valid. JSON harus berisi kunci berikut: 'nama_kandidat' (string), 'skor_kecocokan' (integer 0-100 berdasarkan relevansi untuk posisi software engineer), 'ringkasan' (string, 2-3 kalimat), dan 'skills' (array of strings). Pastikan respons HANYA berisi JSON, tanpa teks tambahan. Teks CV: \n\n" . $text;

        $response = Http::timeout(90)->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
            'contents' => [['parts' => [['text' => $prompt]]]],
            'generationConfig' => [
                'response_mime_type' => 'application/json',
            ],
        ]);

        if (!$response->successful()) {
            throw new Exception('Gagal menghubungi Gemini API: ' . $response->body());
        }

        // =================================================================
        // PERBAIKAN FINAL DI SINI
        // Langsung ambil seluruh body respons yang sudah di-decode sebagai array
        $analysisResult = $response->json();
        // =================================================================

        // Validasi terakhir untuk memastikan hasilnya tidak kosong
        if (empty($analysisResult) || !is_array($analysisResult)) {
            throw new Exception('Menerima respons kosong atau tidak valid dari AI. Respons: ' . $response->body());
        }

        return $analysisResult;
    }
}
