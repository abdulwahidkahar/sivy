<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\AnalyzeResumeJob;
use App\Models\Analysis;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AnalysisController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of analyses.
     */
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'role_id' => 'nullable|integer|exists:roles,id',
            'status' => 'nullable|string|in:pending,processing,completed,failed',
            'search' => 'nullable|string|max:255',
        ]);

        /** @var User $user */
        $user = Auth::user();

        $query = Analysis::query()
            ->whereHas('resume', function ($q) use ($user): void {
                $q->where('user_id', $user->id);
            });

        // Apply filters
        if (!empty($validated['role_id'])) {
            $query->where('role_id', $validated['role_id']);
        }

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (!empty($validated['search'])) {
            $query->whereHas('resume', function ($q) use ($validated): void {
                $q->where('original_filename', 'like', '%' . $validated['search'] . '%');
            });
        }

        $analyses = $query->with(['resume', 'role', 'skills'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $roles = $user->roles()->get();

        return Inertia::render('Analyses/Index', [
            'analyses' => $analyses,
            'roles' => $roles,
            'filters' => $request->only(['role_id', 'status', 'search']),
        ]);
    }

    /**
     * Start analysis for all resumes with the given role.
     */
    public function start(Role $role): RedirectResponse
    {
        $this->authorize('update', $role);

        /** @var User $user */
        $user = Auth::user();
        $resumes = $user->resumes;
        
        if ($resumes->isEmpty()) {
            return redirect()->back()->with('error', 'Tidak ada CV yang tersedia untuk dianalisis.');
        }

        try {
            $dispatchedCount = DB::transaction(function () use ($resumes, $role): int {
                $count = 0;
                
                foreach ($resumes as $resume) {
                    // Check if analysis already exists
                    $existingAnalysis = Analysis::where('resume_id', $resume->id)
                        ->where('role_id', $role->id)
                        ->first();
                    
                    if ($existingAnalysis) {
                        continue; // Skip if analysis already exists
                    }

                    $analysis = Analysis::create([
                        'resume_id' => $resume->id,
                        'role_id' => $role->id,
                        'status' => Analysis::STATUS_PENDING,
                    ]);

                    AnalyzeResumeJob::dispatch($analysis);
                    $count++;
                }
                
                return $count;
            });

            if ($dispatchedCount === 0) {
                return redirect()->back()->with('info', 'Semua CV sudah memiliki analisis untuk role ini.');
            }

            Log::info("Batch analysis started", [
                'user_id' => $user->id,
                'role_id' => $role->id,
                'dispatched_count' => $dispatchedCount,
            ]);

            return redirect()->back()->with('success', "{$dispatchedCount} analisis berhasil dimulai.");

        } catch (Throwable $e) {
            Log::error('Batch analysis failed', [
                'user_id' => $user->id,
                'role_id' => $role->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Terjadi kesalahan saat memulai analisis.');
        }
    }

    /**
     * Display the specified analysis.
     */
    public function show(Analysis $analysis): Response
    {
        // Ensure the analysis belongs to the authenticated user
        $this->authorize('view', $analysis);

        $analysis->load(['resume', 'role', 'skills']);

        return Inertia::render('analyses/show', [
            'analysis' => $analysis,
        ]);
    }
}
