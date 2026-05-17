import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { resendVerification } from '../api/auth';

export default function VerifyEmail() {
  const location = useLocation();
  const stateEmail = (location.state as { email?: string })?.email ?? '';

  const [email, setEmail] = useState(stateEmail);
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email.trim() || loading || cooldown > 0) return;
    setLoading(true);
    setStatus(null);
    try {
      await resendVerification(email);
      setStatus({ type: 'success', message: 'Email renvoyé ! Vérifiez votre boîte de réception.' });
      setCooldown(60);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Une erreur est survenue.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col paper-grain">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md relative">
          {/* Decorative icon */}
          <div className="absolute -top-10 -right-6 opacity-15 rotate-12 pointer-events-none">
            <span className="material-symbols-outlined text-7xl text-primary">mail</span>
          </div>

          <div className="bg-surface-container-lowest rounded-lg card-shadow p-10 relative overflow-hidden">
            {/* Corner decoration */}
            <div className="absolute top-4 right-4 text-secondary-container/40 pointer-events-none">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  mark_email_unread
                </span>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-cursive text-4xl text-primary mb-3">Vérifiez votre email</h1>
              {email ? (
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Un lien de confirmation a été envoyé à{' '}
                  <span className="font-semibold text-on-surface">{email}</span>.
                  <br />Cliquez dessus pour activer votre compte.
                </p>
              ) : (
                <p className="text-sm text-on-surface-variant">Entrez votre email pour recevoir un lien de confirmation.</p>
              )}
            </div>

            {status && (
              <div className={`mb-6 px-4 py-3 rounded-sm text-sm ${status.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-error-container text-on-error-container'}`}>
                {status.message}
              </div>
            )}

            {/* Email input if no state */}
            {!stateEmail && (
              <input
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors mb-4"
              />
            )}

            {/* Tips */}
            <div className="bg-surface-container-low rounded-sm px-4 py-3 mb-6 text-xs text-on-surface-variant space-y-1">
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">info</span>
                Pensez à vérifier vos spams si vous ne trouvez pas l'email.
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">schedule</span>
                Le lien expire dans 60 minutes.
              </p>
            </div>

            {/* Resend */}
            <button
              onClick={handleResend}
              disabled={!email || loading || cooldown > 0}
              className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-base">send</span>
              {cooldown > 0 ? `Renvoyer dans ${cooldown}s` : loading ? 'Envoi…' : "Renvoyer l'email"}
            </button>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-on-surface-variant">
                Email déjà confirmé ?{' '}
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
        </div>
      </main>

      <footer className="py-8 flex flex-col items-center gap-3 text-on-surface-variant/50">
        <p className="text-[10px] uppercase tracking-widest">© 2024 Noteo Academic Atelier.</p>
      </footer>
    </div>
  );
}
