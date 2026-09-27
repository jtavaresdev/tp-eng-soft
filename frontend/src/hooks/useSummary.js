import { useCallback, useEffect, useState } from 'react';
import { getSubscriptionSummary } from '../services/api.js';

const RESUMO_INICIAL = { totalMensal: 0, quantidadeAtivas: 0 };

export function useSubscriptionSummary() {
  const [resumo, setResumo] = useState(RESUMO_INICIAL);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const recarregarResumo = useCallback(() => {
    setCarregando(true);
    setErro(null);
    return getSubscriptionSummary()
      .then(setResumo)
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    recarregarResumo();
  }, [recarregarResumo]);

  return { resumo, carregando, erro, recarregarResumo };
}