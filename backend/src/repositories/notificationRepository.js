import db from '../db/index.js';

export function claimNotification(subscriptionId, cicloCobranca) {
  const resultado = db.prepare(`
    INSERT INTO notification_deliveries (
      subscription_id,
      ciclo_cobranca,
      status,
      tentativa_em,
      erro
    )
    VALUES (?, ?, 'processing', datetime('now'), NULL)
    ON CONFLICT (subscription_id, ciclo_cobranca) DO UPDATE SET
      status = 'processing',
      tentativa_em = datetime('now'),
      erro = NULL
    WHERE notification_deliveries.status = 'failed'
  `).run(subscriptionId, cicloCobranca);

  const entrega = db.prepare(`
    SELECT id, status, tentativa_em AS tentativaEm, enviado_em AS enviadoEm
    FROM notification_deliveries
    WHERE subscription_id = ? AND ciclo_cobranca = ?
  `).get(subscriptionId, cicloCobranca);

  return {
    claimed: resultado.changes === 1,
    delivery: entrega,
  };
}

export function markNotificationSent(subscriptionId, cicloCobranca) {
  return db.prepare(`
    UPDATE notification_deliveries
    SET status = 'sent', enviado_em = datetime('now'), erro = NULL
    WHERE subscription_id = ? AND ciclo_cobranca = ?
  `).run(subscriptionId, cicloCobranca);
}

export function markNotificationFailed(subscriptionId, cicloCobranca, error) {
  const mensagem = String(error?.message || error || 'Erro desconhecido').slice(0, 1000);

  return db.prepare(`
    UPDATE notification_deliveries
    SET status = 'failed', erro = ?
    WHERE subscription_id = ? AND ciclo_cobranca = ?
  `).run(mensagem, subscriptionId, cicloCobranca);
}
