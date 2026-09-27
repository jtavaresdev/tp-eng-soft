import { calcularHistoricoMensal } from '../services/subscriptionsService.js';

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