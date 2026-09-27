import { useCallback, useEffect, useState } from 'react';
import { getMonthlyEvolution } from '../services/api.js';

const HISTORICO_INICIAL = [];

export function useMonthlyEvolution() {
  const [historico, setHistorico] = useState(HISTORICO_INICIAL);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const recarregarHistorico = useCallback(() => {
    setCarregando(true);
    setErro(null);

    return getMonthlyEvolution()
      .then(setHistorico)
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    recarregarHistorico();
  }, [recarregarHistorico]);

  return { historico, carregando, erro, recarregarHistorico };
}
