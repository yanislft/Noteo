<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\Grade;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function index($subjectId)
    {
        $subject = Subject::whereHas('semester.year', function ($q) {
            $q->where('user_id', auth()->id());
        })->where('id', $subjectId)->firstOrFail();

        return response()->json($subject->grades);
    }

    public function store(Request $request, $subjectId)
    {
        $subject = Subject::whereHas('semester.year', function ($q) {
            $q->where('user_id', auth()->id());
        })->where('id', $subjectId)->firstOrFail();

        $request->validate([
            'name' => 'required|string|max:255',
            'value' => 'required|numeric|min:0|max:20',
            'coefficient' => 'numeric|min:0|max:100',
        ]);

        $grade = Grade::create([
            'subject_id' => $subject->id,
            'name' => $request->name,
            'value' => $request->value,
            'coefficient' => $request->coefficient ?? 1,
        ]);

        return response()->json($grade, 201);
    }

    public function update(Request $request, $id)
    {
        $grade = Grade::whereHas('subject.semester.year', function ($q) {
            $q->where('user_id', auth()->id());
        })->where('id', $id)->firstOrFail();

        $request->validate([
            'value' => 'numeric|min:0|max:20',
            'coefficient' => 'numeric|min:0|max:100',
        ]);

        $grade->fill($request->only(['value', 'coefficient']))->save();

        return response()->json($grade);
    }

    public function destroy($id)
    {
        $grade = Grade::whereHas('subject.semester.year', function ($q) {
            $q->where('user_id', auth()->id());
        })->where('id', $id)->firstOrFail();

        $grade->delete();

        return response()->json(['message' => 'Note supprimée']);
    }
}
