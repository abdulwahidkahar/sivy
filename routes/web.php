<?php

use App\Http\Controllers\ResumeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [ResumeController::class, 'index'])->name('dashboard');
    Route::post('/resumes', [ResumeController::class, 'store'])->name('resumes.store');
    Route::post('/resumes/analyze-batch', [ResumeController::class, 'analyzeBatch'])->name('resumes.analyzeBatch');
    Route::get('/resumes/{resume}', [ResumeController::class, 'show'])->name('resumes.show');

    Route::get('/candidates', [ResumeController::class, 'candidates'])->name('candidates.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

