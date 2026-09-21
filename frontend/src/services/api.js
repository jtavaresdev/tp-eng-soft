// Cliente HTTP base da API. Os demais serviços (subscriptions, stats...) usam esta função.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Erro ${response.status} ao acessar a API`);
  }
  return data;
}

export function getHealth() {
  return request('/health');
}
