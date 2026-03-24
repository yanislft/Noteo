<?php

namespace App\Http\Controllers;

use App\Models\Year;
use Illuminate\Http\Request;

class YearController extends Controller
{
    public function index()
    {
        return response()->json(auth()->user()->years);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string']);

        $year = Year::create([
            'user_id' => auth()->id(),
            'name' => $request->name,
        ]);

        return response()->json($year, 201);
    }

    public function destroy($id)
    {
        $year = Year::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        $year->delete();

        return response()->json(['message' => 'Année supprimée']);
    }
}