import { executarJobNotificacoes } from '../services/notificationService.js';
import { hojeUTC, parseDataISOParaUTC } from '../util/dateUtils.js';

function lerDataDeReferencia(req) {
  const rawDate = req.body?.date ?? req.query.date;

  if (rawDate === undefined) {
    return { referencia: hojeUTC() };
  }

  const referencia = parseDataISOParaUTC(rawDate);
  if (!referencia) {
    return {
      error: 'Parâmetro "date" inválido. Use o formato YYYY-MM-DD (ex: 2026-10-05).',
    };
  }

  return { referencia };
}

function lerDiasAlerta(req) {
  const rawValue = req.body?.diasAlerta ?? req.query.diasAlerta;
  if (rawValue === undefined) return undefined;

  const diasAlerta = Number(rawValue);
  if (!Number.isInteger(diasAlerta) || diasAlerta < 0) {
    return { error: 'O campo "diasAlerta" deve ser um inteiro maior ou igual a zero.' };
  }

  return diasAlerta;
}

export async function postNotificationTestRun(req, res) {
  const data = lerDataDeReferencia(req);
  if (data.error) {
    return res.status(400).json({ error: data.error });
  }

  const diasAlerta = lerDiasAlerta(req);
  if (diasAlerta?.error) {
    return res.status(400).json({ error: diasAlerta.error });
  }

  try {
    const resultado = await executarJobNotificacoes({
      referencia: data.referencia,
      diasAlerta,
    });

    if (resultado.falhas > 0) {
      return res.status(500).json({
        error: 'O job foi executado, mas alguns lembretes não foram enviados.',
        ...resultado,
      });
    }

    return res.status(200).json(resultado);
  } catch (error) {
    console.error('[notifications/test-run] Erro ao executar job:', error);
    return res.status(500).json({
      error: 'Não foi possível executar o job de notificações.',
    });
  }
}
