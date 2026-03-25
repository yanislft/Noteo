import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import type { Year, Semester, Subject } from '../types';
import { getGlobalAnalytics, getYearAnalytics, getSemesterAnalytics, getSubjectAnalytics } from '../api/analytics';
import { getYears } from '../api/years';
import { getSemesters } from '../api/semesters';
import { getSubjects } from '../api/subjects';

const COLORS = ['#111827', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [years, setYears] = useState<Year[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [multiLineData, setMultiLineData] = useState<{ data: any[]; keys: string[] } | null>(null);

  const fetchGlobalLineData = async (yearsData: Year[]) => {
    const results = await Promise.all(yearsData.map((y) => getYearAnalytics(y.id)));
    const maxSemesters = Math.max(...results.map((r) => (r.semesters || []).length));
    const data = Array.from({ length: maxSemesters }, (_, i) => {
      const point: any = { name: `Semestre ${i + 1}` };
      results.forEach((r, yi) => {
        const sem = (r.semesters || [])[i];
        point[yearsData[yi].name] = sem ? sem.average : null;
      });
      return point;
    });
    setMultiLineData({ data, keys: yearsData.map((y) => y.name) });
  };

  const fetchYearLineData = async (semestersData: Semester[]) => {
    const results = await Promise.all(semestersData.map((s) => getSemesterAnalytics(s.id)));
    const maxSubjects = Math.max(...results.map((r) => (r.subjects || []).length));
    const data = Array.from({ length: maxSubjects }, (_, i) => {
      const point: any = { name: `Matière ${i + 1}` };
      results.forEach((r, si) => {
        const sub = (r.subjects || [])[i];
        point[semestersData[si].name] = sub ? sub.average : null;
      });
      return point;
    });
    setMultiLineData({ data, keys: semestersData.map((s) => s.name) });
  };

  const fetchSemesterLineData = async (subjectsData: Subject[]) => {
    const results = await Promise.all(subjectsData.map((s) => getSubjectAnalytics(s.id)));
    const maxGrades = Math.max(...results.map((r) => (r.grades || []).length));
    const data = Array.from({ length: maxGrades }, (_, i) => {
      const point: any = { name: `Note ${i + 1}` };
      results.forEach((r, si) => {
        const grade = (r.grades || [])[i];
        point[subjectsData[si].name] = grade ? grade.value : null;
      });
      return point;
    });
    setMultiLineData({ data, keys: subjectsData.map((s) => s.name) });
  };

  useEffect(() => {
    getYears().then((y) => {
      setYears(y);
      fetchGlobalLineData(y);
    });
    getGlobalAnalytics().then(setAnalytics);
  }, []);

  useEffect(() => {
    if (selectedYear) {
      getSemesters(selectedYear).then((sems) => {
        setSemesters(sems);
        fetchYearLineData(sems);
      });
      getYearAnalytics(selectedYear).then(setAnalytics);
      setSelectedSemester(null);
      setSelectedSubject(null);
      setSubjects([]);
      setMultiLineData(null);
    } else {
      getGlobalAnalytics().then(setAnalytics);
      setSemesters([]);
      setSubjects([]);
      fetchGlobalLineData(years);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedSemester) {
      getSubjects(selectedSemester).then((subs) => {
        setSubjects(subs);
        fetchSemesterLineData(subs);
      });
      getSemesterAnalytics(selectedSemester).then(setAnalytics);
      setSelectedSubject(null);
    } else if (selectedYear) {
      getYearAnalytics(selectedYear).then(setAnalytics);
      setSubjects([]);
      setMultiLineData(null);
    }
  }, [selectedSemester]);

  useEffect(() => {
    if (selectedSubject) {
      getSubjectAnalytics(selectedSubject).then(setAnalytics);
    } else if (selectedSemester) {
      getSemesterAnalytics(selectedSemester).then(setAnalytics);
    }
  }, [selectedSubject]);

  const barChartData =
    analytics?.years?.map((y: any) => ({ name: y.name, moyenne: y.average })) ||
    analytics?.semesters?.map((s: any) => ({ name: s.name, moyenne: s.average })) ||
    analytics?.subjects?.map((s: any) => ({ name: s.name, moyenne: s.average })) ||
    analytics?.grades?.map((g: any) => ({ name: g.name, moyenne: g.value })) ||
    [];

  const isMultiLineView =
    (!selectedYear && !selectedSemester && !selectedSubject) ||
    (selectedYear && !selectedSemester && !selectedSubject) ||
    (selectedSemester && !selectedSubject);

  return (
    <div>
      {/* Filtres */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <select
          value={selectedYear ?? ''}
          onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="">Toutes les années</option>
          {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>

        {semesters.length > 0 && (
          <select
            value={selectedSemester ?? ''}
            onChange={(e) => setSelectedSemester(e.target.value ? Number(e.target.value) : null)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">Tous les semestres</option>
            {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}

        {subjects.length > 0 && (
          <select
            value={selectedSubject ?? ''}
            onChange={(e) => setSelectedSubject(e.target.value ? Number(e.target.value) : null)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">Toutes les matières</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      {analytics && (
        <>
          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border border-gray-100 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Moyenne</p>
              <p className="text-2xl font-bold">
                {analytics.average ?? '—'} <span className="text-sm font-normal text-gray-400">/ 20</span>
              </p>
            </div>
            {analytics.best_year && (
              <div className="border border-gray-100 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Meilleure année</p>
                <p className="text-lg font-semibold">{analytics.best_year.name}</p>
                <p className="text-sm text-gray-400">{analytics.best_year.average} / 20</p>
              </div>
            )}
            {analytics.best_semester && (
              <div className="border border-gray-100 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Meilleur semestre</p>
                <p className="text-lg font-semibold">{analytics.best_semester.name}</p>
                <p className="text-sm text-gray-400">{analytics.best_semester.average} / 20</p>
              </div>
            )}
            {analytics.best_subject && (
              <div className="border border-gray-100 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Meilleure matière</p>
                <p className="text-lg font-semibold">{analytics.best_subject.name}</p>
                <p className="text-sm text-gray-400">{analytics.best_subject.average} / 20</p>
              </div>
            )}
            {analytics.best_grade && (
              <div className="border border-gray-100 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Meilleure note</p>
                <p className="text-lg font-semibold">{analytics.best_grade.name}</p>
                <p className="text-sm text-gray-400">{analytics.best_grade.value} / 20</p>
              </div>
            )}
          </div>

          {/* Graphiques */}
          {barChartData.length > 0 && (
            <div className="space-y-8">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-4">Ligne</p>
                <ResponsiveContainer width="100%" height={250}>
                  {isMultiLineView && multiLineData ? (
                    <LineChart data={multiLineData.data}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 20]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      {multiLineData.keys.map((key, i) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={COLORS[i % COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  ) : (
                    <LineChart data={barChartData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 20]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="moyenne" stroke="#111827" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-4">Barres</p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barChartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 20]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="moyenne" fill="#111827" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
