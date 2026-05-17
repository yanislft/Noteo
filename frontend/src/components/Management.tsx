import { useState, useEffect } from 'react';
import type { Year, Semester, Subject, Grade } from '../types';
import { getYears, createYear, deleteYear } from '../api/years';
import { getSemesters, createSemester, deleteSemester } from '../api/semesters';
import { getSubjects, createSubject, updateSubjectCoeff, deleteSubject } from '../api/subjects';
import { getGrades, createGrade, updateGrade, deleteGrade } from '../api/grades';
import { getApiError } from '../api/errors';

type View =
  | { level: 'years' }
  | { level: 'semesters'; year: Year }
  | { level: 'subjects'; year: Year; semester: Semester }
  | { level: 'grades'; year: Year; semester: Semester; subject: Subject };

export default function Management() {
  const [view, setView] = useState<View>({ level: 'years' });
  const [years, setYears] = useState<Year[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [input, setInput] = useState('');
  const [coeffInput, setCoeffInput] = useState('1');
  const [gradeCoeff, setGradeCoeff] = useState('1');
  const [error, setError] = useState('');
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [editCoeff, setEditCoeff] = useState('');
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null);
  const [editGradeValue, setEditGradeValue] = useState('');
  const [editGradeCoeff, setEditGradeCoeff] = useState('');

  useEffect(() => {
    if (view.level === 'years') getYears().then(setYears);
    else if (view.level === 'semesters') getSemesters(view.year.id).then(setSemesters);
    else if (view.level === 'subjects') getSubjects(view.semester.id).then(setSubjects);
    else if (view.level === 'grades') getGrades(view.subject.id).then(setGrades);
    setInput('');
    setCoeffInput('1');
    setGradeCoeff('1');
    setError('');
    setEditingSubjectId(null);
    setEditingGradeId(null);
  }, [view]);

  const handleAdd = async () => {
    if (!input.trim()) return;
    setError('');
    try {
      if (view.level === 'years') {
        const year = await createYear(input);
        setYears([...years, year]);
      } else if (view.level === 'semesters') {
        const semester = await createSemester(view.year.id, input);
        setSemesters([...semesters, semester]);
      } else if (view.level === 'subjects') {
        const subject = await createSubject(view.semester.id, { name: input, coefficient: parseFloat(coeffInput) || 1 });
        setSubjects([...subjects, subject]);
      } else if (view.level === 'grades') {
        const grade = await createGrade(view.subject.id, { name: input, value: parseFloat(coeffInput), coefficient: parseFloat(gradeCoeff) || 1 });
        setGrades([...grades, grade]);
      }
      setInput('');
      setCoeffInput('1');
      setGradeCoeff('1');
    } catch (err) {
      setError(getApiError(err, 'Une erreur est survenue. Vérifiez les valeurs saisies.'));
    }
  };

  const handleUpdateCoeff = async (id: number) => {
    const val = parseFloat(editCoeff);
    if (isNaN(val) || val < 0) return;
    setError('');
    try {
      const updated = await updateSubjectCoeff(id, val);
      setSubjects(subjects.map((s) => (s.id === id ? updated : s)));
      setEditingSubjectId(null);
    } catch (err) {
      setError(getApiError(err, 'Impossible de modifier le coefficient.'));
    }
  };

  const handleUpdateGrade = async (id: number) => {
    const val = parseFloat(editGradeValue);
    const coeff = parseFloat(editGradeCoeff);
    if (isNaN(val) || val < 0 || val > 20 || isNaN(coeff) || coeff < 0) return;
    setError('');
    try {
      const updated = await updateGrade(id, { value: val, coefficient: coeff });
      setGrades(grades.map((g) => (g.id === id ? updated : g)));
      setEditingGradeId(null);
    } catch (err) {
      setError(getApiError(err, 'Impossible de modifier la note.'));
    }
  };

  const handleDelete = async (id: number) => {
    setError('');
    try {
      if (view.level === 'years') { await deleteYear(id); setYears(years.filter((y) => y.id !== id)); }
      else if (view.level === 'semesters') { await deleteSemester(id); setSemesters(semesters.filter((s) => s.id !== id)); }
      else if (view.level === 'subjects') { await deleteSubject(id); setSubjects(subjects.filter((s) => s.id !== id)); }
      else if (view.level === 'grades') { await deleteGrade(id); setGrades(grades.filter((g) => g.id !== id)); }
    } catch (err) {
      setError(getApiError(err, 'Impossible de supprimer cet élément.'));
    }
  };

  const breadcrumb = () => {
    const parts = [];
    if (view.level === 'semesters' || view.level === 'subjects' || view.level === 'grades') {
      parts.push({ label: view.year.name, onClick: () => setView({ level: 'years' }) });
    }
    if (view.level === 'subjects' || view.level === 'grades') {
      parts.push({ label: view.semester.name, onClick: () => setView({ level: 'semesters', year: (view as any).year }) });
    }
    if (view.level === 'grades') {
      parts.push({ label: (view as any).subject.name, onClick: () => setView({ level: 'subjects', year: (view as any).year, semester: (view as any).semester }) });
    }
    return parts;
  };

  const title = { years: 'Années', semesters: 'Semestres', subjects: 'Matières', grades: 'Notes' }[view.level];
  const placeholder = {
    years: "Nom de l'année (ex: 2024-2025)",
    semesters: 'Nom du semestre (ex: Semestre 1)',
    subjects: 'Nom de la matière',
    grades: 'Nom de la note (ex: DS1)',
  }[view.level];

  const items = view.level === 'years' ? years : view.level === 'semesters' ? semesters : view.level === 'subjects' ? subjects : grades;

  const handleItemClick = (item: Year | Semester | Subject | Grade) => {
    if (view.level === 'years') setView({ level: 'semesters', year: item as Year });
    else if (view.level === 'semesters') setView({ level: 'subjects', year: (view as any).year, semester: item as Semester });
    else if (view.level === 'subjects') setView({ level: 'grades', year: (view as any).year, semester: (view as any).semester, subject: item as Subject });
  };

  const levelIcon = { years: 'calendar_today', semesters: 'auto_awesome', subjects: 'book', grades: 'grade' }[view.level];
  const isClickable = view.level !== 'grades';

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-cursive text-5xl text-primary mb-1">Mes Notes</h2>
        <p className="text-on-surface-variant text-sm">Gérez vos années, semestres, matières et notes.</p>
      </header>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm flex-wrap">
        <button
          onClick={() => setView({ level: 'years' })}
          className="text-on-surface-variant hover:text-primary transition-colors font-medium"
        >
          Accueil
        </button>
        {breadcrumb().map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-outline">chevron_right</span>
            <button onClick={b.onClick} className="text-on-surface-variant hover:text-primary transition-colors">
              {b.label}
            </button>
          </span>
        ))}
        <span className="material-symbols-outlined text-base text-outline">chevron_right</span>
        <span className="text-on-surface font-semibold">{title}</span>
      </nav>

      {/* Add form */}
      <div className="bg-surface-container-lowest rounded-lg card-shadow p-6">
        <h3 className="font-semibold text-sm text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">add_circle</span>
          Ajouter {view.level === 'years' ? 'une année' : view.level === 'semesters' ? 'un semestre' : view.level === 'subjects' ? 'une matière' : 'une note'}
        </h3>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 min-w-48 bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
          />
          {view.level === 'subjects' && (
            <input
              type="number"
              placeholder="Coefficient"
              value={coeffInput}
              onChange={(e) => setCoeffInput(e.target.value)}
              min="0"
              className="w-28 bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          )}
          {view.level === 'grades' && (
            <>
              <input
                type="number"
                placeholder="Note /20"
                value={coeffInput}
                onChange={(e) => setCoeffInput(e.target.value)}
                min="0"
                max="20"
                className="w-28 bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="number"
                placeholder="Coefficient"
                value={gradeCoeff}
                onChange={(e) => setGradeCoeff(e.target.value)}
                min="0"
                className="w-28 bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </>
          )}
          <button onClick={handleAdd} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">add</span>
            Ajouter
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-error-container text-on-error-container rounded-sm text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {/* List */}
      <div className="bg-surface-container-lowest rounded-lg card-shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-container flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">{levelIcon}</span>
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="ml-auto text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 mb-3 block">inbox</span>
            <p className="text-sm text-on-surface-variant">Aucun élément. Commencez par en ajouter un.</p>
          </div>
        ) : (
          <div>
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center px-6 py-4 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/40' : ''} hover:bg-surface-container group`}
              >
                <button
                  onClick={() => isClickable && handleItemClick(item)}
                  className={`flex-1 text-left flex items-center gap-3 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-lg group-hover:text-primary transition-colors">
                    {levelIcon}
                  </span>
                  <span className="text-sm font-medium text-on-surface">{item.name}</span>
                  {'value' in item && (
                    <span className="font-cursive text-lg text-primary ml-1">{item.value}</span>
                  )}
                  {'coefficient' in item && view.level === 'grades' && (
                    <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full ml-1">
                      coeff {item.coefficient}
                    </span>
                  )}
                  {isClickable && (
                    <span className="material-symbols-outlined text-sm text-on-surface-variant/30 group-hover:text-primary transition-colors ml-auto mr-2">
                      chevron_right
                    </span>
                  )}
                </button>
                {view.level === 'subjects' && (
                  editingSubjectId === item.id ? (
                    <div className="flex items-center gap-1 ml-2">
                      <input
                        type="number"
                        value={editCoeff}
                        onChange={(e) => setEditCoeff(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateCoeff(item.id); if (e.key === 'Escape') setEditingSubjectId(null); }}
                        min="0"
                        max="100"
                        autoFocus
                        className="w-20 bg-surface-container-low border border-primary rounded-sm px-2 py-1 text-sm focus:outline-none"
                      />
                      <button onClick={() => handleUpdateCoeff(item.id)} className="text-primary hover:text-primary/70 transition-colors">
                        <span className="material-symbols-outlined text-lg">check</span>
                      </button>
                      <button onClick={() => setEditingSubjectId(null)} className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingSubjectId(item.id); setEditCoeff(String(('coefficient' in item ? item.coefficient : 1))); }}
                      className="text-on-surface-variant/20 hover:text-primary transition-colors ml-2 opacity-0 group-hover:opacity-100 flex items-center gap-1"
                    >
                      <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">coeff {'coefficient' in item ? item.coefficient : ''}</span>
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                  )
                )}
                {view.level === 'grades' && (
                  editingGradeId === item.id ? (
                    <div className="flex items-center gap-1 ml-2">
                      <input
                        type="number"
                        value={editGradeValue}
                        onChange={(e) => setEditGradeValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateGrade(item.id); if (e.key === 'Escape') setEditingGradeId(null); }}
                        min="0"
                        max="20"
                        placeholder="/20"
                        autoFocus
                        className="w-20 bg-surface-container-low border border-primary rounded-sm px-2 py-1 text-sm focus:outline-none"
                      />
                      <input
                        type="number"
                        value={editGradeCoeff}
                        onChange={(e) => setEditGradeCoeff(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateGrade(item.id); if (e.key === 'Escape') setEditingGradeId(null); }}
                        min="0"
                        placeholder="coeff"
                        className="w-20 bg-surface-container-low border border-primary rounded-sm px-2 py-1 text-sm focus:outline-none"
                      />
                      <button onClick={() => handleUpdateGrade(item.id)} className="text-primary hover:text-primary/70 transition-colors">
                        <span className="material-symbols-outlined text-lg">check</span>
                      </button>
                      <button onClick={() => setEditingGradeId(null)} className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingGradeId(item.id); setEditGradeValue(String('value' in item ? item.value : '')); setEditGradeCoeff(String('coefficient' in item ? item.coefficient : 1)); }}
                      className="text-on-surface-variant/20 hover:text-primary transition-colors ml-2 opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                  )
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-on-surface-variant/20 hover:text-error transition-colors ml-2 opacity-0 group-hover:opacity-100"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
