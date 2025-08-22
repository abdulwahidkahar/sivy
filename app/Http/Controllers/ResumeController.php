<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\AnalyzeResumeJob;
use App\Models\Analysis;
use App\Models\Resume;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Throwable;

class ResumeController extends Controller
{
    /**
     * Store uploaded resumes and dispatch analysis jobs.
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'resume_files'   => 'required|array|min:1|max:10',
            'resume_files.*' => 'required|file|mimes:pdf|max:5120',
            'role_id'        => [
                'required',
                'integer',
                Rule::exists('roles', 'id')->where('user_id', $user->id),
            ],
        ], [
            'resume_files.*.mimes' => 'Untuk saat ini, hanya file format .pdf yang didukung.',
            'resume_files.*.max'   => 'Ukuran setiap file tidak boleh lebih dari 5MB.',
            'resume_files.max'     => 'Maksimal 10 file dapat diupload sekaligus.',
            'role_id.required'     => 'Silakan pilih profil analisis terlebih dahulu.',
            'role_id.exists'       => 'Profil analisis yang dipilih tidak valid.',
        ]);

        try {
            $result = DB::transaction(function () use ($validated, $user): array {
                $role = Role::findOrFail($validated['role_id']);
                $dispatchedCount = 0;
                $createdAnalyses = [];

                foreach ($validated['resume_files'] as $file) {
                    // Store the file
                    $storagePath = $file->store('resumes', 'public');
                    if (!$storagePath) {
                        throw new \Exception('Failed to store resume file.');
                    }

                    // Create resume record
                    $resume = $user->resumes()->create([
                        'original_filename' => $file->getClientOriginalName(),
                        'storage_path'      => $storagePath,
                    ]);

                    // Create analysis record
                    $analysis = Analysis::create([
                        'resume_id' => $resume->id,
                        'role_id'   => $role->id,
                        'status'    => Analysis::STATUS_PENDING,
                    ]);

                    // Dispatch analysis job
                    AnalyzeResumeJob::dispatch($analysis);
                    $dispatchedCount++;
                    $createdAnalyses[] = $analysis->id;
                }

                return [
                    'dispatched_count' => $dispatchedCount,
                    'analysis_ids' => $createdAnalyses,
                ];
            });

            Log::info("Resume analysis jobs dispatched", [
                'user_id' => $user->id,
                'role_id' => $validated['role_id'],
                'count' => $result['dispatched_count'],
                'analysis_ids' => $result['analysis_ids'],
            ]);

            return redirect()->back()->with('success', 
                "Berhasil mengunggah {$result['dispatched_count']} CV. Analisis sedang diproses."
            );

        } catch (Throwable $e) {
            Log::error('Resume upload failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan saat mengunggah CV. Silakan coba lagi.');
        }
    }
}
