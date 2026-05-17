import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { forgotPassword } from '../api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || cooldown > 0) return;
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      setCooldown(60);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col paper-grain">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md relative">
          <div className="absolute -top-10 -right-6 opacity-15 rotate-12 pointer-events-none">
            <span className="material-symbols-outlined text-7xl text-primary">lock_reset</span>
          </div>

          <div className="bg-surface-container-lowest rounded-lg card-shadow p-10 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-secondary-container/40 pointer-events-none">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>

            <div className="text-center mb-8">
              <h1 className="font-cursive text-4xl text-primary mb-2">Mot de passe oublié</h1>
              <p className="text-sm text-on-surface-variant">
                Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            {sent && (
              <div className="mb-6 px-4 py-3 bg-primary/10 text-primary rounded-sm text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                Si un compte existe pour cet email, un lien a été envoyé. Vérifiez votre boîte de réception.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">send</span>
                {cooldown > 0 ? `Renvoyer dans ${cooldown}s` : loading ? 'Envoi…' : 'Envoyer le lien'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link to="/login" className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Retour à la connexion
              </Link>
            </div>

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
