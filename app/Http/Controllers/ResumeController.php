<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\AnalyzeResumeJob;
use App\Models\Analysis;
use App\Models\Resume;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ResumeController extends Controller
{
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'resume_files'   => 'required|array|min:1',
            'resume_files.*' => 'required|file|mimes:pdf|max:5120',
            'role_id'        => [
                'required',
                Rule::exists('roles', 'id')->where('user_id', $user->id),
            ],
        ], [
            'resume_files.*.mimes' => 'Untuk saat ini, hanya file format .pdf yang didukung.',
            'resume_files.*.max'   => 'Ukuran setiap file tidak boleh lebih dari 5MB.',
            'role_id.required'     => 'Silakan pilih profil analisis terlebih dahulu.',
        ]);

        $role = Role::find($validated['role_id']);
        $dispatchedCount = 0;

        foreach ($validated['resume_files'] as $file) {
            $resume = $user->resumes()->create([
                'original_filename' => $file->getClientOriginalName(),
                'storage_path'      => $file->store('resumes', 'public'),
            ]);

            $analysis = Analysis::create([
                'resume_id' => $resume->id,
                'role_id'   => $role->id,
                'status'    => 'pending',
            ]);

            AnalyzeResumeJob::dispatch($analysis);
            $dispatchedCount++;
        }

        return redirect()->back()->with('success', "{$dispatchedCount} CV berhasil di-upload dan sedang dianalisis.");
    }
}
