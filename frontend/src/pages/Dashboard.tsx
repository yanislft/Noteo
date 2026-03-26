import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Management from '../components/Management';
import Analytics from '../components/Analytics';
import Profile from '../components/Profile';

type View = 'analytics' | 'management' | 'profile';

export default function Dashboard() {
  const [view, setView] = useState<View>('analytics');

  return (
    <div className="flex min-h-screen bg-background paper-grain">
      <Sidebar view={view} onViewChange={setView} />

      <main className="flex-1 md:ml-64 p-5 md:p-8 pb-24 md:pb-8 min-h-screen">
        {view === 'analytics' && <Analytics />}
        {view === 'management' && <Management />}
        {view === 'profile' && <Profile />}
      </main>
    </div>
  );
}
