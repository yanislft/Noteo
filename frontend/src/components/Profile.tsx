import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { updateProfile } from '../api/auth';
import { getApiError } from '../api/errors';

export default function Profile() {
  const { user, setUser } = useAuthStore();

  const [info, setInfo] = useState({
    firstname: user?.firstname ?? '',
    name: user?.name ?? '',
    email: user?.email ?? '',
  });
  const [infoStatus, setInfoStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [infoLoading, setInfoLoading] = useState(false);

  const [pwd, setPwd] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [pwdStatus, setPwdStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  const handleInfoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoLoading(true);
    setInfoStatus(null);
    try {
      const updated = await updateProfile(info);
      setUser(updated);
      setInfoStatus({ type: 'success', message: 'Informations mises à jour avec succès.' });
    } catch (err) {
      setInfoStatus({ type: 'error', message: getApiError(err) });
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePwdSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.password !== pwd.password_confirmation) {
      setPwdStatus({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    setPwdLoading(true);
    setPwdStatus(null);
    try {
      await updateProfile({ ...info, ...pwd });
      setPwd({ current_password: '', password: '', password_confirmation: '' });
      setPwdStatus({ type: 'success', message: 'Mot de passe modifié avec succès.' });
    } catch (err) {
      setPwdStatus({ type: 'error', message: getApiError(err) });
    } finally {
      setPwdLoading(false);
    }
  };

  const initials = user ? `${user.firstname?.[0] ?? ''}${user.name?.[0] ?? ''}`.toUpperCase() : '?';

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-on-primary shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="font-cursive text-5xl text-primary leading-tight">
            {user?.firstname} {user?.name}
          </h2>
          <p className="text-on-surface-variant text-sm">{user?.email}</p>
        </div>
      </header>

      {/* Informations personnelles */}
      <div className="bg-surface-container-lowest rounded-lg card-shadow p-6">
        <h3 className="font-semibold text-sm text-on-surface mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">person</span>
          Informations personnelles
        </h3>

        {infoStatus && (
          <div className={`mb-5 px-4 py-3 rounded-sm text-sm ${infoStatus.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-error-container text-on-error-container'}`}>
            {infoStatus.message}
          </div>
        )}

        <form onSubmit={handleInfoSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-on-surface-variant mb-1.5">Prénom</label>
              <input
                type="text"
                value={info.firstname}
                onChange={(e) => setInfo({ ...info, firstname: e.target.value })}
                required
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1.5">Nom</label>
              <input
                type="text"
                value={info.name}
                onChange={(e) => setInfo({ ...info, name: e.target.value })}
                required
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-on-surface-variant mb-1.5">Email</label>
            <input
              type="email"
              value={info.email}
              onChange={(e) => setInfo({ ...info, email: e.target.value })}
              required
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={infoLoading} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">save</span>
              {infoLoading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>

      {/* Changer le mot de passe */}
      <div className="bg-surface-container-lowest rounded-lg card-shadow p-6">
        <h3 className="font-semibold text-sm text-on-surface mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">lock</span>
          Changer le mot de passe
        </h3>

        {pwdStatus && (
          <div className={`mb-5 px-4 py-3 rounded-sm text-sm ${pwdStatus.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-error-container text-on-error-container'}`}>
            {pwdStatus.message}
          </div>
        )}

        <form onSubmit={handlePwdSave} className="space-y-4">
          {(['current', 'new', 'confirm'] as const).map((key) => {
            const fieldMap = { current: 'current_password', new: 'password', confirm: 'password_confirmation' } as const;
            const labelMap = { current: 'Mot de passe actuel', new: 'Nouveau mot de passe', confirm: 'Confirmer le nouveau mot de passe' };
            const field = fieldMap[key];
            return (
              <div key={key} className="relative">
                <label className="block text-xs text-on-surface-variant mb-1.5">{labelMap[key]}</label>
                <input
                  type={showPwd[key] ? 'text' : 'password'}
                  value={pwd[field]}
                  onChange={(e) => setPwd({ ...pwd, [field]: e.target.value })}
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd({ ...showPwd, [key]: !showPwd[key] })}
                  className="absolute right-3 bottom-2.5 text-on-surface-variant/40 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPwd[key] ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            );
          })}
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={pwdLoading} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">lock_reset</span>
              {pwdLoading ? 'Modification…' : 'Modifier le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
