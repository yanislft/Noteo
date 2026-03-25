import { useState, useEffect } from 'react';
import type { Year, Semester, Subject, Grade } from '../types';
import { getYears, createYear, deleteYear } from '../api/years';
import { getSemesters, createSemester, deleteSemester } from '../api/semesters';
import { getSubjects, createSubject, deleteSubject } from '../api/subjects';
import { getGrades, createGrade, deleteGrade } from '../api/grades';

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

  useEffect(() => {
    if (view.level === 'years') {
      getYears().then(setYears);
    } else if (view.level === 'semesters') {
      getSemesters(view.year.id).then(setSemesters);
    } else if (view.level === 'subjects') {
      getSubjects(view.semester.id).then(setSubjects);
    } else if (view.level === 'grades') {
      getGrades(view.subject.id).then(setGrades);
    }
    setInput('');
    setCoeffInput('1');
  }, [view]);

  const handleAdd = async () => {
    if (!input.trim()) return;
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
      const grade = await createGrade(view.subject.id, { name: input, value: parseFloat(coeffInput), coefficient: 1 });
      setGrades([...grades, grade]);
    }
    setInput('');
    setCoeffInput('1');
  };

  const handleDelete = async (id: number) => {
    if (view.level === 'years') {
      await deleteYear(id);
      setYears(years.filter((y) => y.id !== id));
    } else if (view.level === 'semesters') {
      await deleteSemester(id);
      setSemesters(semesters.filter((s) => s.id !== id));
    } else if (view.level === 'subjects') {
      await deleteSubject(id);
      setSubjects(subjects.filter((s) => s.id !== id));
    } else if (view.level === 'grades') {
      await deleteGrade(id);
      setGrades(grades.filter((g) => g.id !== id));
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

  const title = {
    years: 'Années',
    semesters: 'Semestres',
    subjects: 'Matières',
    grades: 'Notes',
  }[view.level];

  const placeholder = {
    years: 'Nom de l\'année (ex: 2024-2025)',
    semesters: 'Nom du semestre (ex: Semestre 1)',
    subjects: 'Nom de la matière',
    grades: 'Nom de la note (ex: DS1)',
  }[view.level];

  const items =
    view.level === 'years' ? years :
    view.level === 'semesters' ? semesters :
    view.level === 'subjects' ? subjects : grades;

  const handleItemClick = (item: Year | Semester | Subject | Grade) => {
    if (view.level === 'years') setView({ level: 'semesters', year: item as Year });
    else if (view.level === 'semesters') setView({ level: 'subjects', year: (view as any).year, semester: item as Semester });
    else if (view.level === 'subjects') setView({ level: 'grades', year: (view as any).year, semester: (view as any).semester, subject: item as Subject });
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={() => setView({ level: 'years' })} className="hover:text-gray-700">Accueil</button>
        {breadcrumb().map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            <span>/</span>
            <button onClick={b.onClick} className="hover:text-gray-700">{b.label}</button>
          </span>
        ))}
        <span>/</span>
        <span className="text-gray-700 font-medium">{title}</span>
      </div>

      {/* Formulaire d'ajout */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        {(view.level === 'subjects') && (
          <input
            type="number"
            placeholder="Coeff"
            value={coeffInput}
            onChange={(e) => setCoeffInput(e.target.value)}
            min="0"
            className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        )}
        {(view.level === 'grades') && (
          <input
            type="number"
            placeholder="Note /20"
            value={coeffInput}
            onChange={(e) => setCoeffInput(e.target.value)}
            min="0"
            max="20"
            className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        )}
        <button
          onClick={handleAdd}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
        >
          Ajouter
        </button>
      </div>

      {/* Liste */}
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Aucun élément. Commencez par en ajouter un.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50">
              <button
                onClick={() => handleItemClick(item)}
                className={`text-sm font-medium text-left flex-1 ${view.level !== 'grades' ? 'hover:text-blue-600' : 'cursor-default'}`}
              >
                {item.name}
                {'value' in item && <span className="ml-2 text-gray-400 font-normal">{item.value} / 20</span>}
                {'coefficient' in item && view.level === 'subjects' && <span className="ml-2 text-gray-400 font-normal text-xs">coeff {item.coefficient}</span>}
              </button>
              <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-500 text-lg ml-4">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
