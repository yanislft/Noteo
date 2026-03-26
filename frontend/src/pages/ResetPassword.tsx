import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { resetPassword } from '../api/auth';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [showPassword, setShowPassword] = useState({ new: false, confirm: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword({ token, email, ...form });
      navigate('/login?reset=1');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-background flex flex-col paper-grain">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-on-surface-variant mb-4">Lien invalide ou expiré.</p>
            <Link to="/forgot-password" className="btn-primary px-6 py-3 text-sm">
              Refaire une demande
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col paper-grain">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md relative">
          <div className="absolute -top-10 -right-6 opacity-15 rotate-12 pointer-events-none">
            <span className="material-symbols-outlined text-7xl text-primary">lock</span>
          </div>

          <div className="bg-surface-container-lowest rounded-lg card-shadow p-10 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-secondary-container/40 pointer-events-none">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>

            <div className="text-center mb-10">
              <h1 className="font-cursive text-4xl text-primary mb-2">Nouveau mot de passe</h1>
              <p className="text-sm text-on-surface-variant">Pour le compte <span className="font-medium text-on-surface">{email}</span></p>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 bg-error-container text-on-error-container rounded-sm text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
              {(['new', 'confirm'] as const).map((key) => {
                const field = key === 'new' ? 'password' : 'password_confirmation';
                const label = key === 'new' ? 'Nouveau mot de passe' : 'Confirmer le mot de passe';
                const id = key === 'new' ? 'password' : 'password_confirmation';
                return (
                  <div key={key} className="relative">
                    <input
                      type={showPassword[key] ? 'text' : 'password'}
                      id={id}
                      placeholder=" "
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      required
                      minLength={6}
                      className="peer block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:outline-none transition-colors text-on-surface pr-8"
                    />
                    <label
                      htmlFor={id}
                      className="absolute left-0 top-3 text-on-surface-variant/60 text-sm transition-all duration-200 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-85 peer-focus:-translate-y-5 peer-focus:text-primary peer-not-placeholder-shown:scale-85 peer-not-placeholder-shown:-translate-y-5 pointer-events-none"
                    >
                      {label}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, [key]: !showPassword[key] })}
                      className="absolute right-0 top-3 text-on-surface-variant/40 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword[key] ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                );
              })}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enregistrement…' : 'Réinitialiser le mot de passe'}
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </form>

            <div className="absolute -bottom-2 -left-2 opacity-10 pointer-events-none">
              <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                <path d="M5 35C20 32 80 38 115 30" stroke="#316357" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 flex flex-col items-center gap-3 text-on-surface-variant/50">
        <p className="text-[10px] uppercase tracking-widest">© 2024 Noteo Academic Atelier.</p>
      </footer>
    </div>
  );
}
