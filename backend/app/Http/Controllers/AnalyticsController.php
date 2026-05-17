<?php

namespace App\Http\Controllers;

use App\Models\Year;
use App\Models\Semester;
use App\Models\Subject;

class AnalyticsController extends Controller
{
    private function subjectAverage(Subject $subject): float
    {
        $grades = $subject->grades;
        if ($grades->isEmpty()) return 0;

        $total = $grades->sum(fn($g) => $g->value * $g->coefficient);
        $coeffs = $grades->sum(fn($g) => $g->coefficient);

        return $coeffs > 0 ? round($total / $coeffs, 2) : 0;
    }

    private function semesterAverage(Semester $semester): float
    {
        $subjects = $semester->relationLoaded('subjects') ? $semester->subjects : $semester->subjects()->with('grades')->get();
        if ($subjects->isEmpty()) return 0;

        $total = 0;
        $coeffs = 0;

        foreach ($subjects as $subject) {
            $avg = $this->subjectAverage($subject);
            $total += $avg * $subject->coefficient;
            $coeffs += $subject->coefficient;
        }

        return $coeffs > 0 ? round($total / $coeffs, 2) : 0;
    }

    private function yearAverage(Year $year): float
    {
        $semesters = $year->relationLoaded('semesters') ? $year->semesters : $year->semesters()->with('subjects.grades')->get();
        if ($semesters->isEmpty()) return 0;

        $total = $semesters->sum(fn($s) => $this->semesterAverage($s));

        return round($total / $semesters->count(), 2);
    }

    public function global()
    {
        $user = auth()->user();
        $years = Year::where('user_id', $user->id)->with('semesters.subjects.grades')->get();

        $yearsData = $years->map(fn($y) => [
            'id' => $y->id,
            'name' => $y->name,
            'average' => $this->yearAverage($y),
        ]);

        $bestYear = $yearsData->sortByDesc('average')->first();

        $globalAverage = $yearsData->isNotEmpty()
            ? round($yearsData->avg('average'), 2)
            : null;

        // Best semester across all years
        $bestSemester = null;
        $bestSemesterAvg = -1;
        foreach ($years as $year) {
            foreach ($year->semesters as $semester) {
                $avg = $this->semesterAverage($semester);
                if ($avg > $bestSemesterAvg) {
                    $bestSemesterAvg = $avg;
                    $bestSemester = ['id' => $semester->id, 'name' => $semester->name, 'average' => $avg];
                }
            }
        }

        // Best subject across all years
        $bestSubject = null;
        $bestSubjectAvg = -1;
        foreach ($years as $year) {
            foreach ($year->semesters as $semester) {
                foreach ($semester->subjects as $subject) {
                    $avg = $this->subjectAverage($subject);
                    if ($avg > $bestSubjectAvg) {
                        $bestSubjectAvg = $avg;
                        $bestSubject = ['id' => $subject->id, 'name' => $subject->name, 'average' => $avg];
                    }
                }
            }
        }

        // Best grade across all years
        $bestGrade = null;
        $bestGradeValue = -1;
        foreach ($years as $year) {
            foreach ($year->semesters as $semester) {
                foreach ($semester->subjects as $subject) {
                    foreach ($subject->grades as $grade) {
                        if ($grade->value > $bestGradeValue) {
                            $bestGradeValue = $grade->value;
                            $bestGrade = ['id' => $grade->id, 'name' => $grade->name, 'value' => $grade->value];
                        }
                    }
                }
            }
        }

        return response()->json([
            'average' => $globalAverage,
            'years' => $yearsData->values(),
            'best_year' => $bestYear,
            'best_semester' => $bestSemester,
            'best_subject' => $bestSubject,
            'best_grade' => $bestGrade,
        ]);
    }

    public function year($id)
    {
        $year = Year::where('id', $id)->where('user_id', auth()->id())
            ->with('semesters.subjects.grades')->firstOrFail();

        $semestersData = $year->semesters->map(fn($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'average' => $this->semesterAverage($s),
        ]);

        $bestSemester = $semestersData->sortByDesc('average')->first();

        return response()->json([
            'year' => $year->name,
            'average' => $this->yearAverage($year),
            'semesters' => $semestersData->values(),
            'best_semester' => $bestSemester,
        ]);
    }

    public function semester($id)
    {
        $semester = Semester::whereHas('year', fn($q) => $q->where('user_id', auth()->id()))
            ->where('id', $id)->with('subjects.grades')->firstOrFail();

        $subjectsData = $semester->subjects->map(fn($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'coefficient' => $s->coefficient,
            'average' => $this->subjectAverage($s),
        ]);

        $bestSubject = $subjectsData->sortByDesc('average')->first();

        return response()->json([
            'semester' => $semester->name,
            'average' => $this->semesterAverage($semester),
            'subjects' => $subjectsData->values(),
            'best_subject' => $bestSubject,
        ]);
    }

    public function subject($id)
    {
        $subject = Subject::whereHas('semester.year', fn($q) => $q->where('user_id', auth()->id()))
            ->where('id', $id)->with('grades')->firstOrFail();

        $bestGrade = $subject->grades->sortByDesc('value')->first();

        return response()->json([
            'subject' => $subject->name,
            'average' => $this->subjectAverage($subject),
            'grades' => $subject->grades->values(),
            'best_grade' => $bestGrade,
        ]);
    }
}
