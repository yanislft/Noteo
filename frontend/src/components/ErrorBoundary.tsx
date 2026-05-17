import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="text-center">
            <p className="font-cursive text-[10rem] text-primary/10 leading-none select-none">Oops</p>
            <h1 className="font-cursive text-4xl text-primary -mt-8 mb-4">Une erreur est survenue</h1>
            <p className="text-on-surface-variant text-sm mb-8">
              Quelque chose s'est mal passé. Rechargez la page ou revenez à l'accueil.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary px-6 py-3 text-sm"
              >
                Recharger
              </button>
              <Link to="/" className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-base">home</span>
                Accueil
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
