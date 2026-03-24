<?php

namespace App\Http\Controllers;

use App\Models\Semester;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index($semesterId)
    {
        $semester = Semester::whereHas('year', function ($q) {
            $q->where('user_id', auth()->id());
        })->where('id', $semesterId)->firstOrFail();

        return response()->json($semester->subjects);
    }

    public function store(Request $request, $semesterId)
    {
        $semester = Semester::whereHas('year', function ($q) {
            $q->where('user_id', auth()->id());
        })->where('id', $semesterId)->firstOrFail();

        $request->validate([
            'name' => 'required|string',
            'coefficient' => 'numeric|min:0',
        ]);

        $subject = Subject::create([
            'semester_id' => $semester->id,
            'name' => $request->name,
            'coefficient' => $request->coefficient ?? 1,
        ]);

        return response()->json($subject, 201);
    }

    public function destroy($id)
    {
        $subject = Subject::whereHas('semester.year', function ($q) {
            $q->where('user_id', auth()->id());
        })->where('id', $id)->firstOrFail();

        $subject->delete();

        return response()->json(['message' => 'Matière supprimée']);
    }
}