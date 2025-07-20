<?php

use App\Http\Controllers\Api\ResumeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/text', [\App\Http\Controllers\ResumeController::class, 'getText']);

Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/resumes', [ResumeController::class, 'index'])->name('resumes.index');
    Route::post('/resumes', [ResumeController::class, 'store'])->name('resumes.store');
    Route::post('/resumes/analyze-batch', [ResumeController::class, 'analyzeBatch'])->name('resumes.analyzeBatch');

});
