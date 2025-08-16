<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Analysis;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CandidateController extends Controller
{
    /**
     * Display a listing of candidates.
     */
    public function index(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        $analyses = Analysis::whereHas('resume', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->with('resume')->get();

        $candidates = $analyses->map(function ($analysis) {
            $resultData = $analysis->raw_result ?? [];

            return [
                'id' => $analysis->id,
                'original_filename' => $analysis->resume->original_filename ?? 'Unknown',
                'analysis_result' => [
                    // Ambil NAMA dan SKOR dari sumber yang sama dan konsisten.
                    'nama_kandidat' => $resultData['nama_kandidat'] ?? 'Nama Tidak Ditemukan',
                    'skor_kecocokan' => round($resultData['technical_score'] ?? 0),
                ],
            ];
        });

        return Inertia::render('candidates/index', [
            'candidates' => $candidates,
        ]);
    }
}
