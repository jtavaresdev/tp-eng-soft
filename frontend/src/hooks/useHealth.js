import { useEffect, useState } from 'react';
import { getHealth } from '../services/api.js';

// Consulta o /health da API. status: 'loading' | 'ok' | 'error'
export default function useHealth() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelado = false;
    getHealth()
      .then((data) => !cancelado && setStatus(data.status === 'ok' ? 'ok' : 'error'))
      .catch(() => !cancelado && setStatus('error'));
    return () => {
      cancelado = true;
    };
  }, []);

  return status;
}
