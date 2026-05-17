export function getApiError(err: unknown, fallback = 'Une erreur est survenue.'): string {
  if (!err || typeof err !== 'object') return fallback;

  const e = err as Record<string, any>;

  if (!e.response) {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
  }

  const { status, data } = e.response;

  if (status === 429) return 'Trop de tentatives. Veuillez patienter avant de réessayer.';
  if (status >= 500) return 'Une erreur serveur est survenue. Veuillez réessayer plus tard.';

  // Laravel validation errors: pick the first message from any field
  if (data?.errors) {
    const first = Object.values(data.errors as Record<string, string[]>)[0];
    if (Array.isArray(first) && first.length > 0) return first[0];
  }

  return data?.message ?? fallback;
}
