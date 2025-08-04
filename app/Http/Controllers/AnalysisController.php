<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\AnalyzeResumeJob;
use App\Models\Analysis;
use App\Models\Role;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests; // 1. Impor trait
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AnalysisController extends Controller
{
    use AuthorizesRequests; // 2. Gunakan trait di dalam class

    public function index(Request $request)
    {
        $request->validate(['role_id' => 'nullable|exists:roles,id']);

        $query = Analysis::query()->whereHas('resume', function ($q) {
            $q->where('user_id', Auth::id());
        });

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        $analyses = $query->with(['resume', 'role', 'skills'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $roles = Auth::user()->roles()->get();

        return Inertia::render('Analyses/Index', [
            'analyses' => $analyses,
            'roles' => $roles,
            'filters' => $request->only(['role_id']),
        ]);
    }

    public function start(Role $role)
    {
        // Baris ini sekarang akan berfungsi dengan benar
        $this->authorize('update', $role);

        $resumes = Auth::user()->resumes;
        $dispatchedCount = 0;

        foreach ($resumes as $resume) {
            $analysis = Analysis::firstOrCreate(
                [
                    'resume_id' => $resume->id,
                    'role_id'   => $role->id,
                ],
                [
                    'status' => 'pending',
                ]
            );

            if ($analysis->status === 'pending') {
                AnalyzeResumeJob::dispatch($analysis);
                $dispatchedCount++;
            }
        }

        $message = $dispatchedCount > 0
            ? "Proses analisis dimulai untuk {$dispatchedCount} CV."
            : "Semua CV sudah dianalisis untuk profil ini.";

        return redirect()->back()->with('success', $message);
    }

    public function show(Analysis $analysis)
    {
//        // Baris ini sekarang akan berfungsi dengan benar
//        $this->authorize('view', $analysis);

        $analysis->load(['resume', 'role', 'skills']);

        return Inertia::render('analyses/show', [
            'analysis' => $analysis,
        ]);
    }
}
