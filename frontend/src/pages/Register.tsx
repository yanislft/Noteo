import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { register } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { getApiError } from '../api/errors';

export default function Register() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [form, setForm] = useState({ name: '', firstname: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (token) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      setError(getApiError(err, "Une erreur est survenue lors de l'inscription"));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col paper-grain">
      <Navbar />

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md relative">
          {/* Decorative icon */}
          <div className="absolute -top-10 -right-6 opacity-15 rotate-12 pointer-events-none">
            <span className="material-symbols-outlined text-7xl text-primary">auto_awesome</span>
          </div>

          {/* Card */}
          <div className="bg-surface-container-lowest rounded-lg card-shadow p-10 relative overflow-hidden">
            {/* Corner decoration */}
            <div className="absolute top-4 right-4 text-secondary-container/40 pointer-events-none">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>

            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="font-cursive text-4xl text-primary mb-2">Créer un compte</h1>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 bg-error-container text-on-error-container rounded-sm text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Nom / Prénom */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    id="firstname"
                    placeholder=" "
                    value={form.firstname}
                    onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                    required
                    className="peer block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:outline-none transition-colors text-on-surface"
                  />
                  <label
                    htmlFor="firstname"
                    className="absolute left-0 top-3 text-on-surface-variant/60 text-sm transition-all duration-200 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-85 peer-focus:-translate-y-5 peer-focus:text-primary peer-not-placeholder-shown:scale-85 peer-not-placeholder-shown:-translate-y-5 pointer-events-none"
                  >
                    Prénom
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    placeholder=" "
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="peer block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:outline-none transition-colors text-on-surface"
                  />
                  <label
                    htmlFor="name"
                    className="absolute left-0 top-3 text-on-surface-variant/60 text-sm transition-all duration-200 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-85 peer-focus:-translate-y-5 peer-focus:text-primary peer-not-placeholder-shown:scale-85 peer-not-placeholder-shown:-translate-y-5 pointer-events-none"
                  >
                    Nom
                  </label>
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  placeholder=" "
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="peer block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:outline-none transition-colors text-on-surface"
                />
                <label
                  htmlFor="email"
                  className="absolute left-0 top-3 text-on-surface-variant/60 text-sm transition-all duration-200 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-85 peer-focus:-translate-y-5 peer-focus:text-primary peer-not-placeholder-shown:scale-85 peer-not-placeholder-shown:-translate-y-5 pointer-events-none"
                >
                  Email
                </label>
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder=" "
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="peer block w-full px-0 py-3 bg-transparent border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:outline-none transition-colors text-on-surface pr-8"
                />
                <label
                  htmlFor="password"
                  className="absolute left-0 top-3 text-on-surface-variant/60 text-sm transition-all duration-200 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-85 peer-focus:-translate-y-5 peer-focus:text-primary peer-not-placeholder-shown:scale-85 peer-not-placeholder-shown:-translate-y-5 pointer-events-none"
                >
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-3 text-on-surface-variant/40 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Submit */}
              <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-sm">
                Créer mon compte
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </form>

            {/* Footer link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-on-surface-variant">
                Déjà inscrit ?{' '}
                <Link to="/login" className="text-primary font-bold pencil-underline ml-1">
                  Se connecter
                </Link>
              </p>
            </div>

            {/* Bottom SVG decoration */}
            <div className="absolute -bottom-2 -left-2 opacity-10 pointer-events-none">
              <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                <path d="M5 35C20 32 80 38 115 30" stroke="#316357" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Trust icons */}
          <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
            <span className="material-symbols-outlined text-2xl text-on-surface-variant">verified_user</span>
            <span className="material-symbols-outlined text-2xl text-on-surface-variant">lock</span>
            <span className="material-symbols-outlined text-2xl text-on-surface-variant">privacy_tip</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 flex flex-col items-center gap-3 text-on-surface-variant/50">
        <nav className="flex gap-8 text-[10px] uppercase tracking-widest">
          <a href="#" className="hover:text-primary transition-colors">Confidentialité</a>
          <a href="#" className="hover:text-primary transition-colors">Conditions</a>
          <a href="#" className="hover:text-primary transition-colors">Support</a>
        </nav>
        <p className="text-[10px] uppercase tracking-widest">© 2024 Noteo Academic Atelier. Fait avec soin pour les étudiants.</p>
      </footer>
    </div>
  );
}
