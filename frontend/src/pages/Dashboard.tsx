import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { logout } from '../api/auth';
import Management from '../components/Management';
import Analytics from '../components/Analytics';

type Tab = 'management' | 'analytics';

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('management');
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    clearAuth();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-100">
        <span className="font-bold text-xl">Noteo</span>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setTab('management')}
            className={`text-sm ${tab === 'management' ? 'font-semibold text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
          >
            Gestion
          </button>
          <button
            onClick={() => setTab('analytics')}
            className={`text-sm ${tab === 'analytics' ? 'font-semibold text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
          >
            Analytique
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.firstname} {user?.name}</span>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500">Déconnexion</button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-10">
        {tab === 'management' ? <Management /> : <Analytics />}
      </main>
    </div>
  );
}
