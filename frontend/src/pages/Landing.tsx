import { useState } from 'react';
import { Link } from 'react-router-dom';

interface CalcGrade {
  value: string;
  coefficient: string;
}

interface CalcSubject {
  name: string;
  coefficient: string;
  grades: CalcGrade[];
}

function subjectAverage(subject: CalcSubject): number | null {
  const validGrades = subject.grades.filter((g) => g.value !== '');
  if (validGrades.length === 0) return null;
  let total = 0;
  let totalCoeff = 0;
  for (const g of validGrades) {
    const value = parseFloat(g.value);
    const coeff = parseFloat(g.coefficient) || 1;
    if (isNaN(value)) return null;
    total += value * coeff;
    totalCoeff += coeff;
  }
  return totalCoeff > 0 ? Math.round((total / totalCoeff) * 100) / 100 : 0;
}

export default function Landing() {
  const [subjects, setSubjects] = useState<CalcSubject[]>([
    { name: '', coefficient: '', grades: [{ value: '', coefficient: '' }] },
  ]);
  const [average, setAverage] = useState<number | null>(null);

  const addSubject = () => {
    setSubjects([...subjects, { name: '', coefficient: '', grades: [{ value: '', coefficient: '' }] }]);
    setAverage(null);
  };

  const removeSubject = (i: number) => {
    setSubjects(subjects.filter((_, idx) => idx !== i));
    setAverage(null);
  };

  const updateSubject = (i: number, field: 'name' | 'coefficient', value: string) => {
    const updated = [...subjects];
    updated[i][field] = value;
    setSubjects(updated);
    setAverage(null);
  };

  const addGrade = (i: number) => {
    const updated = [...subjects];
    updated[i].grades.push({ value: '', coefficient: '' });
    setSubjects(updated);
    setAverage(null);
  };

  const removeGrade = (i: number, j: number) => {
    const updated = [...subjects];
    updated[i].grades = updated[i].grades.filter((_, idx) => idx !== j);
    setSubjects(updated);
    setAverage(null);
  };

  const updateGrade = (i: number, j: number, field: keyof CalcGrade, value: string) => {
    const updated = [...subjects];
    updated[i].grades[j][field] = value;
    setSubjects(updated);
    setAverage(null);
  };

  const calculate = () => {
    let total = 0;
    let totalCoeff = 0;
    for (const s of subjects) {
      const avg = subjectAverage(s);
      if (avg === null) return;
      const coeff = parseFloat(s.coefficient) || 1;
      total += avg * coeff;
      totalCoeff += coeff;
    }
    setAverage(totalCoeff > 0 ? Math.round((total / totalCoeff) * 100) / 100 : 0);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-100">
        <span className="font-bold text-xl">Noteo</span>
        <div className="flex gap-4">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">Connexion</Link>
          <Link to="/register" className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-700">S'inscrire</Link>
        </div>
      </nav>

      {/* Présentation */}
      <section className="max-w-2xl mx-auto px-8 py-24 text-center">
        <h1 className="text-4xl font-bold mb-4">Suivez vos notes simplement</h1>
        <p className="text-gray-500 text-lg mb-8">
          Organisez vos années, semestres et matières. Calculez vos moyennes et visualisez vos progrès.
        </p>
        <Link to="/register" className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition">
          Commencer gratuitement
        </Link>
      </section>

      {/* Calculateur */}
      <section className="max-w-xl mx-auto px-8 py-16 border-t border-gray-100">
        <h2 className="text-2xl font-bold mb-2">Calculateur de moyenne</h2>
        <p className="text-gray-500 text-sm mb-6">Sans inscription. Ajoutez vos matières et leurs notes.</p>

        <div className="space-y-4">
          {subjects.map((s, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              {/* En-tête matière */}
              <div className="flex gap-2 items-center mb-3">
                <input
                  type="text"
                  placeholder="Nom de la matière"
                  value={s.name}
                  onChange={(e) => updateSubject(i, 'name', e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <input
                  type="number"
                  placeholder="Coeff matière"
                  value={s.coefficient}
                  onChange={(e) => updateSubject(i, 'coefficient', e.target.value)}
                  min="0"
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                {subjects.length > 1 && (
                  <button onClick={() => removeSubject(i)} className="text-gray-400 hover:text-red-500 text-lg">×</button>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2 ml-2">
                {s.grades.map((g, j) => (
                  <div key={j} className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Note /20"
                      value={g.value}
                      onChange={(e) => updateGrade(i, j, 'value', e.target.value)}
                      min="0"
                      max="20"
                      className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                    <input
                      type="number"
                      placeholder="Coeff note"
                      value={g.coefficient}
                      onChange={(e) => updateGrade(i, j, 'coefficient', e.target.value)}
                      min="0"
                      className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                    {s.grades.length > 1 && (
                      <button onClick={() => removeGrade(i, j)} className="text-gray-400 hover:text-red-500 text-sm">×</button>
                    )}
                  </div>
                ))}
                <button onClick={() => addGrade(i)} className="text-xs text-gray-400 hover:text-gray-700 mt-1">
                  + Ajouter une note
                </button>
              </div>

              {/* Moyenne de la matière */}
              {subjectAverage(s) !== null && (
                <p className="text-xs text-gray-400 mt-2 text-right">
                  Moy. matière : <span className="font-medium text-gray-600">{subjectAverage(s)} / 20</span>
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={addSubject} className="text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
            + Ajouter une matière
          </button>
          <button onClick={calculate} className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            Calculer
          </button>
        </div>

        {average !== null && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">Votre moyenne générale</p>
            <p className="text-3xl font-bold text-gray-900">{average} <span className="text-lg font-normal text-gray-400">/ 20</span></p>
          </div>
        )}
      </section>
    </div>
  );
}
