<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\AnalyzeResumeJob;
use App\Models\Resume;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ResumeController extends Controller
{
    /**
     * Menampilkan halaman Dashboard dengan data resume terakhir.
     */
    public function index()
    {
        $user = Auth::user();

        $resumes = $user->resumes()
            ->latest()
            ->take(10)
            ->get();

        $averageScore = $user->resumes()
            ->where('status', 'completed')
            ->whereNotNull('analysis_result')
            ->get()
            ->avg(function ($resume) {
                return data_get($resume->analysis_result, 'skor_kecocokan', 0);
            });

        return Inertia::render('dashboard', [
            'resumes' => $resumes,
            'stats' => [
                'total' => $user->resumes()->count(),
                'newThisMonth' => $user->resumes()
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'averageScore' => round($averageScore ?? 0, 2),
            ],
        ]);
    }

    /**
     * Upload file resume via form Inertia.
     */
    public function store(Request $request)
    {
        // PENYESUAIAN: Batasi upload hanya untuk PDF agar sesuai dengan kemampuan AnalyzeResumeJob
        $validated = $request->validate([
            'resume_files'   => 'required|array|min:1',
            'resume_files.*' => 'required|file|mimes:pdf|max:5120', // Hanya izinkan PDF
        ], [
            'resume_files.*.mimes' => 'Untuk saat ini, hanya file format .pdf yang didukung.',
            'resume_files.*.max' => 'Ukuran setiap file tidak boleh lebih dari 5MB.',
        ]);

        foreach ($validated['resume_files'] as $file) {
            $path = $file->store('resumes', 'public');

            Resume::create([
                'user_id'           => Auth::id(),
                'original_filename' => $file->getClientOriginalName(),
                'storage_path'      => $path,
                'status'            => 'pending',
                'analysis_result'   => null,
            ]);
        }

        $fileCount = count($validated['resume_files']);
        $message = $fileCount . ' resume berhasil di-upload.';

        return redirect()->back()->with('success', $message);
    }

    public function show(Resume $resume)
    {
        \Log::info('Resume User ID:', ['id' => $resume->user_id]);
        \Log::info('Auth ID:', ['id' => Auth::id()]);

        if($resume->user_id != Auth::id()){
            abort(403, 'UNAUTHORIZED ACTION');
        }

        return Inertia::render('resume/show', [
            'resume' => $resume,
        ]);
    }

    /**
     * Jalankan proses analisis via tombol di UI.
     */
    public function analyzeBatch()
    {
        $pendingResumes = Auth::user()->resumes()
            ->where('status', 'pending')
            ->get();

        if ($pendingResumes->isEmpty()) {
            return redirect()->back()->with('info', 'Tidak ada resume yang perlu dianalisis.');
        }

        foreach ($pendingResumes as $resume) {
            try {
                AnalyzeResumeJob::dispatch($resume);
            } catch (\Exception $e) {
                Log::error("Gagal mengirim job untuk resume ID: {$resume->id}. Error: " . $e->getMessage());
            }
        }

        $jobCount = $pendingResumes->count();
        return redirect()->back()->with('success', "Proses analisis dimulai untuk {$jobCount} resume.");
    }

    public function candidates()
    {
        $user = Auth::user();

        // Ambil SEMUA resume yang sudah 'completed' dan urutkan dari skor tertinggi
        $candidates = $user->resumes()
            ->where('status', 'completed')
            ->whereNotNull('analysis_result')
            ->get()
            ->sortByDesc(function ($resume) {
                return data_get($resume->analysis_result, 'skor_kecocokan', 0);
            });

        // Kirim data 'candidates' ke komponen
        return Inertia::render('candidates/index', [
            'candidates' => $candidates->values()->all(),
        ]);
    }
}
