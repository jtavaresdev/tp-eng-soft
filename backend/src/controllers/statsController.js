import {
  calcularGastosPorCategoria,
  calcularHistoricoMensal,
} from '../services/subscriptionsService.js';

export async function getMonthlyHistory(req, res) {
  try {
    const historico = await calcularHistoricoMensal();
    return res.status(200).json(historico);
  } catch (error) {
    console.error('[stats/monthly-history] Erro ao calcular histórico mensal:', error);
    return res.status(500).json({
      error: 'Não foi possível calcular o histórico mensal de gastos.',
    });
  }
}

export async function getGastosPorCategoria(req, res) {
  try {
    const gastos = await calcularGastosPorCategoria();
    return res.status(200).json(gastos);
  } catch (error) {
    console.error('[stats/by-category] Erro ao calcular gastos por categoria:', error);
    return res.status(500).json({
      error: 'Não foi possível calcular os gastos por categoria.',
    });
  }
}
