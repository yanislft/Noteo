import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const initials = user ? `${user.firstname?.[0] ?? ''}${user.name?.[0] ?? ''}`.toUpperCase() : '';

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-surface-container-high">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between md:grid md:grid-cols-3">
        <Link to="/" className="font-cursive text-2xl text-primary">Noteo</Link>
        <nav className="hidden md:flex gap-8 items-center justify-center">
          <Link to="/" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Accueil</Link>
          <a href="/#calculator" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Calculateur</a>
        </nav>
        <div className="flex gap-1 md:gap-3 items-center justify-end">
          {user ? (
            <>
              <Link to="/dashboard" className="text-xs md:text-sm text-on-surface-variant hover:text-primary transition-colors font-medium px-2 md:px-4 py-2 truncate max-w-[100px] md:max-w-none">
                Tableau de bord
              </Link>
              <Link to="/dashboard" className="flex items-center gap-2 btn-primary text-sm px-4 md:px-5 py-2">
                <div className="w-5 h-5 rounded-full bg-on-primary/20 flex items-center justify-center text-[10px] font-bold">
                  {initials}
                </div>
                <span className="hidden sm:inline">{user.firstname}</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="md:hidden text-sm text-on-surface-variant hover:text-primary transition-colors font-medium px-3 py-2">
                Accueil
              </Link>
              <Link to="/login" className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium px-3 md:px-4 py-2">
                Connexion
              </Link>
              <Link to="/register" className="btn-primary text-sm px-4 md:px-5 py-2.5">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
