<?php

use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ResumeController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\CandidateController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Mengelola Roles (Profil Analisis)
    Route::resource('roles', RoleController::class)->except(['create', 'edit']);

    // Mengelola Resumes (hanya untuk upload dari dashboard)
    Route::post('/resumes', [ResumeController::class, 'store'])->name('resumes.store');

    // Mengelola Analyses (Halaman Daftar Kandidat & Detail)
    Route::get('/analyses', [AnalysisController::class, 'index'])->name('analyses.index');
    Route::get('/analyses/{analysis}', [AnalysisController::class, 'show'])->name('analyses.show');
    Route::post('/roles/{role}/start-analysis', [AnalysisController::class, 'start'])->name('analyses.start');

    Route::get('/candidates', [CandidateController::class, 'index'])->name('candidates.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
