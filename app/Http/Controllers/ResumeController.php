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
    public function index()
    {
        $user = Auth::user();

        $resumes = $user->resumes()
            ->latest()
            ->take(10)
            ->get();

        $completedResumes = $user->resumes()
            ->where('status', 'completed')
            ->whereNotNull('analysis_result')
            ->get();

        $averageScore = round($completedResumes->avg(fn($resume) => data_get($resume->analysis_result, 'skor_kecocokan', 0)) ?? 0, 2);

        return Inertia::render('dashboard', [
            'resumes' => $resumes,
            'stats' => [
                'total' => $user->resumes()->count(),
                'newThisMonth' => $user->resumes()
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'averageScore' => $averageScore,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'resume_files' => 'required|array|min:1',
            'resume_files.*' => 'required|file|mimes:pdf|max:5120',
        ], [
            'resume_files.*.mimes' => 'Untuk saat ini, hanya file format .pdf yang didukung.',
            'resume_files.*.max' => 'Ukuran setiap file tidak boleh lebih dari 5MB.',
        ]);

        foreach ($validated['resume_files'] as $file) {
            // Buat record resume di database
            $resume = Resume::create([
                'user_id' => Auth::id(),
                'original_filename' => $file->getClientOriginalName(),
                'storage_path' => $file->store('resumes', 'public'),
                'status' => 'pending',
            ]);

            AnalyzeResumeJob::dispatch($resume);
        }

        return redirect()->back()->with('success', count($validated['resume_files']) . ' resume berhasil di-upload.');
    }

    public function show(Resume $resume)
    {
        if ($resume->user_id !== Auth::id()) {
            abort(403, 'UNAUTHORIZED ACTION');
        }

        return Inertia::render('resume/show', [
            'resume' => $resume,
        ]);
    }

    public function candidates()
    {
        $candidates = Auth::user()->resumes()
            ->where('status', 'completed')
            ->whereNotNull('analysis_result')
            ->get()
            ->sortByDesc(fn($resume) => data_get($resume->analysis_result, 'skor_kecocokan', 0))
            ->values();

        return Inertia::render('candidates/index', [
            'candidates' => $candidates,
        ]);
    }
}
