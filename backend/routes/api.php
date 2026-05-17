<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\YearController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\AnalyticsController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('email/resend', [AuthController::class, 'resendVerification'])->middleware('throttle:6,1');
    Route::post('password/forgot', [AuthController::class, 'forgotPassword'])->middleware('throttle:6,1');
    Route::post('password/reset', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');
    Route::get('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
});

Route::middleware(['auth:api', 'throttle:120,1'])->group(function () {
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
    Route::patch('subjects/{id}', [SubjectController::class, 'update']);
    Route::delete('subjects/{id}', [SubjectController::class, 'destroy']);

    Route::get('subjects/{subject}/grades', [GradeController::class, 'index']);
    Route::post('subjects/{subject}/grades', [GradeController::class, 'store']);
    Route::patch('grades/{id}', [GradeController::class, 'update']);
    Route::delete('grades/{id}', [GradeController::class, 'destroy']);

    Route::get('analytics/global', [AnalyticsController::class, 'global']);
    Route::get('analytics/year/{id}', [AnalyticsController::class, 'year']);
    Route::get('analytics/semester/{id}', [AnalyticsController::class, 'semester']);
    Route::get('analytics/subject/{id}', [AnalyticsController::class, 'subject']);
});
