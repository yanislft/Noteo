<?php

namespace App\Http\Controllers;

use App\Models\Year;
use App\Models\Semester;
use Illuminate\Http\Request;

class SemesterController extends Controller
{
    public function index($yearId)
    {
        $year = Year::where('id', $yearId)->where('user_id', auth()->id())->firstOrFail();

        return response()->json($year->semesters);
    }

    public function store(Request $request, $yearId)
    {
        $year = Year::where('id', $yearId)->where('user_id', auth()->id())->firstOrFail();

        $request->validate(['name' => 'required|string|max:255']);

        $semester = Semester::create([
            'year_id' => $year->id,
            'name' => $request->name,
        ]);

        return response()->json($semester, 201);
    }

    public function destroy($id)
    {
        $semester = Semester::whereHas('year', function ($q) {
            $q->where('user_id', auth()->id());
        })->where('id', $id)->firstOrFail();

        $semester->delete();

        return response()->json(['message' => 'Semestre supprimé']);
    }
}
