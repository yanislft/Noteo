import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col paper-grain">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-cursive text-[10rem] text-primary/10 leading-none select-none">404</p>
          <h1 className="font-cursive text-4xl text-primary -mt-8 mb-4">Page introuvable</h1>
          <p className="text-on-surface-variant text-sm mb-8">
            La page que vous cherchez n'existe pas ou a été déplacée.
          </p>
          <Link to="/" className="btn-primary px-8 py-3 text-sm inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-base">home</span>
            Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
