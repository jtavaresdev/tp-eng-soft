import {
  atualizarAssinatura,
  buscarAssinaturas,
  cancelarAssinatura,
  criarAssinatura,
  validarAssinatura,
  calcularResumoMensal,
  buscarProximasCobrancas,
} from '../services/subscriptionsService.js';

import { hojeUTC, parseDataISOParaUTC } from '../util/dateUtils.js';

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function getSubscriptions(req, res) {
  const status = req.query.status || 'ativo';
  res.json(buscarAssinaturas(status));
}

export function postSubscription(req, res) {
  const dados = req.body || {};
  const erros = validarAssinatura(dados);

  if (erros.length > 0) {
    return res.status(400).json({ error: erros[0] });
  }

  return res.status(201).json(criarAssinatura(dados));
}

export function putSubscription(req, res) {
  const dados = req.body || {};
  const erros = validarAssinatura(dados);

  if (erros.length > 0) {
    return res.status(400).json({ error: erros[0] });
  }

  const id = parseId(req.params.id);
  const assinaturaAtualizada = id === null ? null : atualizarAssinatura(id, dados);

  if (!assinaturaAtualizada) {
    return res.status(404).json({ error: 'Assinatura não encontrada' });
  }

  return res.status(200).json(assinaturaAtualizada);
}

export function deleteSubscription(req, res) {
  const id = parseId(req.params.id);
  const assinaturaCancelada = id === null ? null : cancelarAssinatura(id);

  if (!assinaturaCancelada) {
    return res.status(404).json({ error: 'Assinatura não encontrada' });
  }

  return res.status(200).json(assinaturaCancelada);
}

export async function getSummary(req, res) {
  try {
    const resumo = await calcularResumoMensal();
    return res.status(200).json(resumo);
  } catch (error) {
    console.error('[subscriptions/summary] Erro ao calcular resumo:', error);
    return res.status(500).json({
      error: 'Não foi possível calcular o resumo das assinaturas.',
    });
  }
}

export async function getUpcomingCharges(req, res) {
  try {
    const { date } = req.query;
    let referencia = hojeUTC();
 
    if (date !== undefined) {
      const dataParseada = parseDataISOParaUTC(date);
 
      if (!dataParseada) {
        return res.status(400).json({
          error: 'Parâmetro "date" inválido. Use o formato YYYY-MM-DD (ex: 2026-02-25).',
        });
      }
 
      referencia = dataParseada;
    }
 
    const proximasCobrancas = await buscarProximasCobrancas({ referencia });
    return res.status(200).json(proximasCobrancas);
  } catch (error) {
    console.error('[subscriptions/upcoming-charges] Erro ao calcular próximas cobranças:', error);
    return res.status(500).json({
      error: 'Não foi possível calcular as próximas cobranças.',
    });
  }
}