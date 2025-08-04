<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Analysis;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $recentAnalyses = Analysis::whereHas('resume', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->with('resume')->latest()->take(10)->get();

        $allAnalyses = Analysis::whereHas('resume', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        });

        $completedAnalyses = (clone $allAnalyses)->where('status', 'completed');

        $stats = [
            'total' => (clone $allAnalyses)->count(),
            'newThisMonth' => (clone $allAnalyses)->where('created_at', '>=', now()->subDays(30))->count(),
            'averageScore' => round($completedAnalyses->avg('technical_score') ?? 0, 2),
        ];

        $roles = $user->roles()->get(['id', 'name']);

        return Inertia::render('dashboard', [
            'recentAnalyses' => $recentAnalyses,
            'stats' => $stats,
            'roles' => $roles,
        ]);
    }
}
