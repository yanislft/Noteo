<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\YearController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\AnalyticsController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('email/resend', [AuthController::class, 'resendVerification'])->middleware('throttle:6,1');
    Route::get('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
});

Route::middleware('auth:api')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::put('auth/profile', [AuthController::class, 'update']);

    Route::get('years', [YearController::class, 'index']);
    Route::post('years', [YearController::class, 'store']);
    Route::delete('years/{id}', [YearController::class, 'destroy']);

    Route::get('years/{year}/semesters', [SemesterController::class, 'index']);
    Route::post('years/{year}/semesters', [SemesterController::class, 'store']);
    Route::delete('semesters/{id}', [SemesterController::class, 'destroy']);

    Route::get('semesters/{semester}/subjects', [SubjectController::class, 'index']);
    Route::post('semesters/{semester}/subjects', [SubjectController::class, 'store']);
    Route::delete('subjects/{id}', [SubjectController::class, 'destroy']);

    Route::get('subjects/{subject}/grades', [GradeController::class, 'index']);
    Route::post('subjects/{subject}/grades', [GradeController::class, 'store']);
    Route::delete('grades/{id}', [GradeController::class, 'destroy']);

    Route::get('analytics/global', [AnalyticsController::class, 'global']);
    Route::get('analytics/year/{id}', [AnalyticsController::class, 'year']);
    Route::get('analytics/semester/{id}', [AnalyticsController::class, 'semester']);
    Route::get('analytics/subject/{id}', [AnalyticsController::class, 'subject']);
});
