<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Analysis;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $roles = $user->roles()->get(['id', 'name']);

        // Validasi bahwa role_id yang diminta (jika ada) adalah milik user
        $request->validate([
            'role_id' => [
                'nullable',
                'integer',
                function ($attribute, $value, $fail) use ($roles) {
                    if (!$roles->contains('id', $value)) {
                        $fail("The selected {$attribute} is invalid.");
                    }
                },
            ],
        ]);

        // Tentukan ID filter yang aktif.
        // Jika tidak ada role_id di request, gunakan ID dari role pertama.
        // Jika tidak ada role sama sekali, nilainya akan null.
        $filterRoleId = $request->input('role_id') ?: $roles->first()->id ?? null;

        // --- Bangun Query Dasar ---
        $allAnalysesQuery = Analysis::whereHas('resume', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        });

        // Terapkan filter HANYA JIKA ada role ID yang aktif
        if ($filterRoleId) {
            $allAnalysesQuery->where('role_id', $filterRoleId);
        }

        // --- Ambil Data ---
        $recentAnalyses = (clone $allAnalysesQuery)->with('resume')->latest()->take(10)->get();
        $completedAnalyses = (clone $allAnalysesQuery)->where('status', 'completed');

        // --- Hitung Statistik ---
        $stats = [
            'total' => (clone $allAnalysesQuery)->count(),
            'newThisMonth' => (clone $allAnalysesQuery)->where('created_at', '>=', now()->subDays(30))->count(),
            'averageScore' => round((clone $completedAnalyses)->avg('technical_score') ?? 0, 2),
        ];

        return Inertia::render('dashboard', [
            'recentAnalyses' => $recentAnalyses,
            'stats' => $stats,
            'roles' => $roles,
            'filters' => ['role_id' => $filterRoleId ? (int)$filterRoleId : null],
        ]);
    }
}
