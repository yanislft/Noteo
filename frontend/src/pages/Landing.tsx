import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

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
    { name: 'Mathématiques', coefficient: '4', grades: [{ value: '14.5', coefficient: '1' }] },
    { name: 'Littérature', coefficient: '3', grades: [{ value: '12', coefficient: '1' }] },
    { name: 'Histoire-Géo', coefficient: '2', grades: [{ value: '16', coefficient: '1' }] },
  ]);
  const [average, setAverage] = useState<number | null>(14.0);

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

  const [calcError, setCalcError] = useState('');

  const calculate = () => {
    setCalcError('');
    let total = 0;
    let totalCoeff = 0;
    for (const s of subjects) {
      const avg = subjectAverage(s);
      if (avg === null) {
        setCalcError('Veuillez remplir toutes les notes avant de calculer.');
        return;
      }
      const coeff = parseFloat(s.coefficient) || 1;
      total += avg * coeff;
      totalCoeff += coeff;
    }
    setAverage(totalCoeff > 0 ? Math.round((total / totalCoeff) * 100) / 100 : 0);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans paper-grain">

      <Navbar />

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 items-center gap-16">
        <div className="relative">
          {/* Decorative SVG */}
          <svg className="absolute -top-8 -left-8 w-20 h-20 text-primary opacity-10 pointer-events-none" viewBox="0 0 100 100">
            <path d="M10,50 Q25,25 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="20" cy="20" r="5" fill="currentColor" opacity="0.5" />
          </svg>
          <h1 className="font-cursive text-5xl md:text-7xl text-primary leading-tight mb-6">
            Votre Atelier<br />D'Analyse Scolaire
          </h1>
          <p className="text-xl text-on-surface-variant mb-10 max-w-lg leading-relaxed">
            Suivez vos notes, visualisez vos progrès et organisez vos études avec une touche d'art.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary px-8 py-4 text-base">
              Commencer gratuitement
            </Link>
            <a href="#calculator" className="border-2 border-primary text-primary px-8 py-4 rounded-sm text-base font-semibold hover:bg-primary/5 transition-colors">
              Essayer le calculateur
            </a>
          </div>
        </div>

        {/* Dashboard Mockup */}
        <div className="relative">
          <div className="bg-surface-container-lowest rounded-lg card-shadow p-6 transform -rotate-2 hover:rotate-0 transition-transform duration-500 border border-outline-variant/10 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container text-lg">school</span>
              </div>
              <div>
                <div className="h-3 w-28 bg-surface-container-high rounded-full mb-1.5" />
                <div className="h-2 w-16 bg-surface-container rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-surface-container-low rounded-lg p-4">
                <div className="h-1.5 w-10 bg-primary/20 rounded-full mb-3" />
                <div className="font-cursive text-3xl text-primary">16.5</div>
                <div className="text-[10px] text-primary/60 uppercase tracking-wider mt-1">Moyenne</div>
              </div>
              <div className="bg-surface-container-low rounded-lg p-4">
                <div className="h-1.5 w-10 bg-tertiary/20 rounded-full mb-3" />
                <div className="font-cursive text-3xl text-tertiary">20</div>
                <div className="text-[10px] text-tertiary/60 uppercase tracking-wider mt-1">Meilleure note</div>
              </div>
            </div>
            <div className="space-y-2">
              {['Maths', 'Littérature', 'Histoire'].map((s, i) => (
                <div key={s} className="h-10 bg-surface rounded-lg flex items-center px-3 gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ['#316357','#745b00','#a03629'][i] }} />
                  <div className="text-xs text-on-surface-variant">{s}</div>
                  <div className="ml-auto h-1.5 rounded-full bg-surface-container-high" style={{ width: `${[75,60,85][i]}%`, maxWidth: '6rem' }} />
                </div>
              ))}
            </div>
            <div className="absolute -top-3 -right-3 text-secondary-container">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
          </div>
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-cursive text-4xl text-center text-on-surface mb-4">
          Des outils pensés pour les étudiants
        </h2>
        <p className="text-center text-on-surface-variant mb-14 max-w-xl mx-auto">
          Tout ce dont vous avez besoin pour suivre votre parcours académique, au même endroit.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: 'edit_note',
              bg: 'bg-primary-fixed',
              iconColor: 'text-primary',
              title: 'Carnets intelligents',
              desc: 'Organisez vos années, semestres et matières avec une interface fluide et intuitive.',
            },
            {
              icon: 'auto_graph',
              bg: 'bg-secondary-fixed',
              iconColor: 'text-secondary',
              title: 'Suivi des notes',
              desc: 'Visualisez vos progrès avec des graphiques élégants et des annotations qui célèbrent vos victoires.',
            },
            {
              icon: 'calculate',
              bg: 'bg-tertiary-fixed',
              iconColor: 'text-tertiary',
              title: 'Calcul de moyenne',
              desc: 'Calculez vos moyennes pondérées instantanément, par matière, semestre ou année.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-surface-container-lowest p-8 rounded-lg card-shadow-md border border-outline-variant/5 hover:-translate-y-1 transition-transform">
              <div className={`w-14 h-14 rounded-lg ${f.bg} flex items-center justify-center mb-6`}>
                <span className={`material-symbols-outlined text-3xl ${f.iconColor}`}>{f.icon}</span>
              </div>
              <h3 className="text-lg font-bold mb-3">{f.title}</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Calculator ── */}
      <section id="calculator" className="max-w-3xl mx-auto px-6 py-20">
        <div className="bg-surface-container-lowest rounded-lg card-shadow p-8 md:p-12 relative border border-outline-variant/10 overflow-hidden">
          {/* Washi tape */}
          <div className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2 w-36 h-8 rotate-1 opacity-90" />

          <h2 className="font-cursive text-4xl text-primary text-center mb-2">Calcule ta moyenne</h2>
          <p className="text-center text-sm text-on-surface-variant mb-10">Sans inscription. Ajoute tes matières et tes notes.</p>

          <div className="space-y-4">
            {subjects.map((s, i) => (
              <div key={i} className="bg-surface-container-low rounded-lg p-4">
                {/* Subject header */}
                <div className="flex gap-2 items-center mb-3">
                  <input
                    type="text"
                    placeholder="Nom de la matière"
                    value={s.name}
                    onChange={(e) => updateSubject(i, 'name', e.target.value)}
                    className="flex-1 bg-transparent border-b-2 border-outline-variant/30 focus:border-primary outline-none py-1.5 text-sm font-medium transition-colors"
                  />
                  <input
                    type="number"
                    placeholder="Coeff."
                    value={s.coefficient}
                    onChange={(e) => updateSubject(i, 'coefficient', e.target.value)}
                    min="0"
                    className="w-20 bg-transparent border-b-2 border-outline-variant/30 focus:border-primary outline-none py-1.5 text-sm text-center transition-colors"
                  />
                  {subjects.length > 1 && (
                    <button onClick={() => removeSubject(i)} className="text-on-surface-variant/40 hover:text-error transition-colors ml-1">
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  )}
                </div>

                {/* Grades */}
                <div className="space-y-2 ml-2">
                  {s.grades.map((g, j) => (
                    <div key={j} className="flex gap-2 items-center">
                      <input
                        type="number"
                        placeholder="Note /20"
                        value={g.value}
                        onChange={(e) => updateGrade(i, j, 'value', e.target.value)}
                        min="0" max="20"
                        className="w-24 bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                      <input
                        type="number"
                        placeholder="Coeff."
                        value={g.coefficient}
                        onChange={(e) => updateGrade(i, j, 'coefficient', e.target.value)}
                        min="0"
                        className="w-20 bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                      {s.grades.length > 1 && (
                        <button onClick={() => removeGrade(i, j)} className="text-on-surface-variant/40 hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addGrade(i)} className="text-xs text-on-surface-variant/60 hover:text-primary transition-colors mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Ajouter une note
                  </button>
                </div>

                {/* Subject average */}
                {subjectAverage(s) !== null && (
                  <p className="text-xs text-on-surface-variant/60 mt-3 text-right">
                    Moy. matière : <span className="font-semibold text-primary">{subjectAverage(s)} / 20</span>
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <button onClick={addSubject} className="btn-secondary text-sm px-5 py-2.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">add</span>
              Ajouter une matière
            </button>
            <button onClick={calculate} className="btn-primary text-sm px-6 py-2.5">
              Calculer
            </button>
          </div>

          {calcError && (
            <p className="mt-4 text-sm text-error flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">error</span>
              {calcError}
            </p>
          )}

          {average !== null && (
            <div className="mt-8 text-right">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant/60 font-bold mb-1">Moyenne générale</p>
              <p className="font-cursive text-6xl text-primary">{average}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-primary rounded-lg p-12 md:p-20 text-center text-on-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary-container/20 rounded-full -mr-24 -mt-24 blur-3xl" />
          <h2 className="font-cursive text-5xl md:text-7xl mb-6 relative z-10">Prenez le contrôle de vos notes</h2>
          <p className="text-on-primary/80 text-lg mb-10 max-w-xl mx-auto relative z-10">
            Rejoignez des milliers d'étudiants qui ont transformé leur chaos académique en chef-d'œuvre.
          </p>
          <Link to="/register" className="btn-secondary inline-block px-10 py-4 text-lg relative z-10">
            Créer mon compte
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-surface-container-low border-t border-surface-container-high py-12 flex flex-col items-center gap-4">
        <span className="font-cursive text-xl text-primary">Noteo</span>
        <nav className="flex gap-8 text-[10px] uppercase tracking-widest text-on-surface-variant/60">
          <a href="#" className="hover:text-primary transition-colors">Confidentialité</a>
          <a href="#" className="hover:text-primary transition-colors">Conditions</a>
          <a href="#" className="hover:text-primary transition-colors">Support</a>
        </nav>
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/50">
          © 2024 Noteo Academic Atelier. Fait avec soin pour les étudiants.
        </p>
      </footer>
    </div>
  );
}
