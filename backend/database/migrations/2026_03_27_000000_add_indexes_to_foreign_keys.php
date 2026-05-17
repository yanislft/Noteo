<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('years', function (Blueprint $table) {
            $table->index('user_id');
        });

        Schema::table('semesters', function (Blueprint $table) {
            $table->index('year_id');
        });

        Schema::table('subjects', function (Blueprint $table) {
            $table->index('semester_id');
        });

        Schema::table('grades', function (Blueprint $table) {
            $table->index('subject_id');
        });
    }

    public function down(): void
    {
        Schema::table('years', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });

        Schema::table('semesters', function (Blueprint $table) {
            $table->dropIndex(['year_id']);
        });

        Schema::table('subjects', function (Blueprint $table) {
            $table->dropIndex(['semester_id']);
        });

        Schema::table('grades', function (Blueprint $table) {
            $table->dropIndex(['subject_id']);
        });
    }
};
