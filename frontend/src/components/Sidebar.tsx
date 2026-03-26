import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { logout } from '../api/auth';

type View = 'analytics' | 'management' | 'profile';

interface SidebarProps {
  view: View;
  onViewChange: (v: View) => void;
}

const navItems: { view: View; icon: string; label: string }[] = [
  { view: 'analytics', icon: 'dashboard', label: 'Tableau de bord' },
  { view: 'management', icon: 'grade', label: 'Notes' },
];

export default function Sidebar({ view, onViewChange }: SidebarProps) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    clearAuth();
    navigate('/');
  };

  const initials = user
    ? `${user.firstname?.[0] ?? ''}${user.name?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col py-8 z-50"
        style={{ backgroundColor: '#316357', borderRadius: '0 2rem 2rem 0' }}
      >
        {/* Logo */}
        <div className="px-8 mb-12">
          <h1 className="font-cursive text-3xl text-white">Noteo</h1>
          <p className="text-white/50 text-[10px] uppercase tracking-widest mt-1">Academic Atelier</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = view === item.view;
            return (
              <button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                className={`w-full flex items-center gap-3 py-3 text-sm font-medium transition-all ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:text-white px-8 hover:bg-white/5'
                }`}
                style={
                  active
                    ? { paddingLeft: '1rem', marginLeft: '1rem', borderRadius: '9999px 0 0 9999px' }
                    : {}
                }
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-5 mt-auto space-y-4">
          {/* User card */}
          <button
            onClick={() => onViewChange('profile')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${view === 'profile' ? 'bg-white/20 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
          >
            <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-sm font-bold text-on-primary-fixed-variant shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-white text-sm font-semibold truncate">
                {user?.firstname} {user?.name}
              </p>
              <p className="text-white/40 text-[10px] truncate">{user?.email}</p>
            </div>
            <span className="material-symbols-outlined text-white/40 text-base shrink-0">chevron_right</span>
          </button>

            {/* Home */}
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-2 py-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg">home</span>
            Accueil
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-2 py-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
        style={{ backgroundColor: '#316357', borderRadius: '1.25rem 1.25rem 0 0' }}
      >
        {navItems.map((item) => {
          const active = view === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
                active ? 'text-white' : 'text-white/50'
              }`}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => onViewChange('profile')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${view === 'profile' ? 'text-white' : 'text-white/50'}`}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={view === 'profile' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            person
          </span>
          <span className="text-[10px] font-medium">Profil</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex-none flex flex-col items-center justify-center gap-1 py-3 px-5 text-white/50 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">logout</span>
          <span className="text-[10px] font-medium">Quitter</span>
        </button>
      </nav>
    </>
  );
}
