import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import type { Year, Semester, Subject } from '../types';
import { getGlobalAnalytics, getYearAnalytics, getSemesterAnalytics, getSubjectAnalytics } from '../api/analytics';
import { getYears } from '../api/years';
import { getSemesters } from '../api/semesters';
import { getSubjects } from '../api/subjects';
import { useAuthStore } from '../store/authStore';

// Vivid palette aligned with the design system
const COLORS = ['#316357', '#fdcc22', '#e86b5a', '#4a7c6f', '#f0c110', '#c04e3f', '#9dd1c2', '#745b00'];

function averageStyle(avg: number | null): { textClass: string; barColor: string; bgClass: string } {
  if (avg === null || avg === undefined) return { textClass: 'text-on-surface', barColor: '#316357', bgClass: '' };
  if (avg < 5)  return { textClass: 'text-error',    barColor: '#ba1a1a', bgClass: 'bg-error-container/50' };
  if (avg < 10) return { textClass: 'text-tertiary',  barColor: '#a03629', bgClass: 'bg-tertiary-fixed/40' };
  if (avg < 15) return { textClass: 'text-secondary', barColor: '#745b00', bgClass: 'bg-secondary-fixed/40' };
  return { textClass: 'text-primary', barColor: '#316357', bgClass: 'bg-primary-fixed/40' };
}

function FilterSelect({
  icon,
  value,
  onChange,
  active,
  children,
}: {
  icon: string;
  value: string | number;
  onChange: (v: string) => void;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative flex items-center gap-1.5 rounded-full border transition-colors overflow-hidden ${
      active
        ? 'bg-primary border-primary text-white'
        : 'bg-surface-container-lowest border-outline-variant/25 text-on-surface hover:border-primary/40'
    }`}>
      <span
        className={`material-symbols-outlined text-base pl-3 pointer-events-none ${active ? 'text-white' : 'text-on-surface-variant'}`}
      >
        {icon}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none bg-transparent text-sm font-medium pr-7 pl-1 py-2 focus:outline-none cursor-pointer ${
          active ? 'text-white' : 'text-on-surface'
        }`}
      >
        {children}
      </select>
      <span
        className={`material-symbols-outlined text-base absolute right-2 pointer-events-none ${active ? 'text-white/70' : 'text-on-surface-variant/50'}`}
      >
        expand_more
      </span>
    </div>
  );
}

export default function Analytics() {
  const user = useAuthStore((s) => s.user);
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
    const maxSemesters = Math.max(...results.map((r) => (r.semesters || []).length), 0);
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
    const maxSubjects = Math.max(...results.map((r) => (r.subjects || []).length), 0);
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
    const maxGrades = Math.max(...results.map((r) => (r.grades || []).length), 0);
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

  const barChartData = (
    analytics?.years?.map((y: any, i: number) => ({ name: y.name, moyenne: y.average, fill: COLORS[i % COLORS.length] })) ||
    analytics?.semesters?.map((s: any, i: number) => ({ name: s.name, moyenne: s.average, fill: COLORS[i % COLORS.length] })) ||
    analytics?.subjects?.map((s: any, i: number) => ({ name: s.name, moyenne: s.average, fill: COLORS[i % COLORS.length] })) ||
    analytics?.grades?.map((g: any, i: number) => ({ name: g.name, moyenne: g.value, fill: COLORS[i % COLORS.length] })) ||
    []
  );

  const isMultiLineView =
    (!selectedYear && !selectedSemester && !selectedSubject) ||
    (selectedYear && !selectedSemester && !selectedSubject) ||
    (selectedSemester && !selectedSubject);

  const kpiCards = [
    analytics?.best_year    && { label: 'Meilleure année',    value: analytics.best_year.name,    sub: `${analytics.best_year.average} / 20`,    icon: 'workspace_premium', color: 'text-secondary',  bg: 'bg-secondary-fixed/20' },
    analytics?.best_semester && { label: 'Meilleur semestre', value: analytics.best_semester.name, sub: `${analytics.best_semester.average} / 20`, icon: 'potted_plant',      color: 'text-primary',    bg: 'bg-primary-fixed/20' },
    analytics?.best_subject  && { label: 'Meilleure matière', value: analytics.best_subject.name,  sub: `${analytics.best_subject.average} / 20`,  icon: 'brush',             color: 'text-tertiary',   bg: 'bg-tertiary-fixed/20' },
    analytics?.best_grade    && { label: 'Meilleure note',    value: analytics.best_grade.name,    sub: `${analytics.best_grade.value} / 20`,      icon: 'star',              color: 'text-on-surface-variant', bg: 'bg-surface-container-high' },
  ].filter(Boolean) as { label: string; value: string; sub: string; icon: string; color: string; bg: string }[];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-cursive text-5xl text-primary mb-1">
          Bienvenue, {user?.firstname} !
        </h2>
        <p className="text-on-surface-variant">Votre parcours académique se déroule brillamment.</p>
      </header>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <FilterSelect
          icon="calendar_today"
          value={selectedYear ?? ''}
          onChange={(v) => setSelectedYear(v ? Number(v) : null)}
          active={!!selectedYear}
        >
          <option value="">Toutes les années</option>
          {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
        </FilterSelect>

        {semesters.length > 0 && (
          <FilterSelect
            icon="auto_awesome"
            value={selectedSemester ?? ''}
            onChange={(v) => setSelectedSemester(v ? Number(v) : null)}
            active={!!selectedSemester}
          >
            <option value="">Tous les semestres</option>
            {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </FilterSelect>
        )}

        {subjects.length > 0 && (
          <FilterSelect
            icon="book"
            value={selectedSubject ?? ''}
            onChange={(v) => setSelectedSubject(v ? Number(v) : null)}
            active={!!selectedSubject}
          >
            <option value="">Toutes les matières</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </FilterSelect>
        )}
      </div>

      {analytics && (
        <>
          {/* Average hero */}
          {(() => {
            const style = averageStyle(analytics.average);
            return (
              <div className={`rounded-lg card-shadow p-6 flex items-center gap-6 ${style.bgClass || 'bg-surface-container-lowest'}`}>
                <div>
                  <p className="text-xs uppercase tracking-widest text-on-surface-variant/60 font-bold mb-1">Moyenne générale</p>
                  <p className={`font-cursive text-6xl ${style.textClass}`}>{analytics.average ?? '—'}</p>
                  <p className="text-sm text-on-surface-variant mt-1">sur 20</p>
                </div>
                {analytics.average !== null && analytics.average !== undefined && (
                  <div className="flex-1">
                    <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(analytics.average / 20) * 100}%`, backgroundColor: style.barColor }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-on-surface-variant/50 mt-1">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                      <span>15</span>
                      <span>20</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* KPI Cards */}
          {kpiCards.length > 0 && (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {kpiCards.map((card) => (
                <div
                  key={card.label}
                  className={`${card.bg} rounded-lg p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform card-shadow-md`}
                >
                  <p className={`${card.color} font-bold text-[10px] uppercase tracking-widest mb-2`}>{card.label}</p>
                  <p className="font-cursive text-3xl text-on-surface leading-tight">{card.value}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{card.sub}</p>
                  <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:rotate-12 transition-transform">
                    <span className={`material-symbols-outlined text-6xl ${card.color}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                      {card.icon}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Charts */}
          {barChartData.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Line chart */}
              <div className="xl:col-span-2 bg-surface-container-lowest rounded-lg card-shadow p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-cursive text-2xl text-primary">Courbe de progression</h3>
                    <p className="text-on-surface-variant text-xs mt-0.5">Évolution de vos moyennes dans le temps</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  {isMultiLineView && multiLineData ? (
                    <LineChart data={multiLineData.data}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#404946' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 20]} tick={{ fontSize: 10, fill: '#404946' }} axisLine={false} tickLine={false} width={24} />
                      <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 16px rgba(74,124,111,0.12)', fontFamily: 'Plus Jakarta Sans' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Plus Jakarta Sans' }} />
                      {multiLineData.keys.map((key, i) => (
                        <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} dot={{ r: 4, fill: COLORS[i % COLORS.length] }} connectNulls />
                      ))}
                    </LineChart>
                  ) : (
                    <LineChart data={barChartData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#404946' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 20]} tick={{ fontSize: 10, fill: '#404946' }} axisLine={false} tickLine={false} width={24} />
                      <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 16px rgba(74,124,111,0.12)', fontFamily: 'Plus Jakarta Sans' }} />
                      <Line type="monotone" dataKey="moyenne" stroke="#316357" strokeWidth={2.5} dot={{ r: 4, fill: '#316357' }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Bar chart — Overview */}
              <div className="bg-surface-container-lowest rounded-lg card-shadow p-6">
                <h3 className="font-cursive text-2xl text-primary mb-1">Vue d'ensemble des moyennes</h3>
                <p className="text-on-surface-variant text-xs mb-6">
                  {selectedSubject ? 'par note' : selectedSemester ? 'par matière' : selectedYear ? 'par semestre' : 'par année'}
                </p>
                <div className="space-y-5">
                  {barChartData.slice(0, 5).map((item: any, i: number) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-on-surface truncate max-w-[10rem]">{item.name}</span>
                        <span style={{ color: COLORS[i % COLORS.length] }}>{item.moyenne} / 20</span>
                      </div>
                      <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(item.moyenne / 20) * 100}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bar chart full-width */}
          {barChartData.length > 0 && (
            <div className="bg-surface-container-lowest rounded-lg card-shadow p-6">
              <h3 className="font-cursive text-2xl text-primary mb-6">Comparatif des moyennes</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barChartData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#404946' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 10, fill: '#404946' }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 16px rgba(74,124,111,0.12)', fontFamily: 'Plus Jakarta Sans' }} />
                  <Bar
                    dataKey="moyenne"
                    radius={[6, 6, 0, 0]}
                    shape={(props: any) => {
                      const { x, y, width, height, payload } = props;
                      return <rect x={x} y={y} width={width} height={Math.max(0, height)} fill={payload?.fill ?? '#316357'} rx={6} />;
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {barChartData.length === 0 && (
            <div className="bg-surface-container-lowest rounded-lg card-shadow p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">auto_graph</span>
              <p className="text-on-surface-variant text-sm">Aucune donnée à afficher pour cette sélection.</p>
              <p className="text-on-surface-variant/60 text-xs mt-1">Ajoutez des notes dans la section "Notes" pour voir vos statistiques.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
