// Área 4 — Job de notificações · US4
// Alvo: executarJobNotificacoes (src/services/notificationService.js)
//       src/repositories/notificationRepository.js
//       POST /notifications/test-run (notificationsController)
//
// Teste de INTEGRAÇÃO: o job roda de verdade contra o SQLite de teste; só o
// envio do e-mail é um dublê injetado por parâmetro.
// O serviço roda com SQLite isolado e transporte de e-mail falso.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../helpers/api.js';
import { inserirAssinatura, limparBanco } from '../helpers/banco.js';
import { executarJobNotificacoes } from '../../src/services/notificationService.js';
import db from '../../src/db/index.js';

// Cobrança todo dia 5; em 03/10 faltam 2 dias (janela padrão = 3).
const REFERENCIA = new Date(Date.UTC(2026, 9, 3));

function criarTransporterFalso() {
  return { sendMail: vi.fn().mockResolvedValue({ messageId: 'msg-123' }) };
}

beforeEach(limparBanco);

describe('executarJobNotificacoes', () => {
  // Exemplo pronto
  it('envia o lembrete da cobrança próxima e registra a entrega', async () => {
    inserirAssinatura({ nome: 'Netflix', data_cobranca: '2026-01-05' });
    const transporter = criarTransporterFalso();

    const resumo = await executarJobNotificacoes({ referencia: REFERENCIA, transporter });

    expect(resumo).toMatchObject({ encontradas: 1, enviadas: 1, ignoradas: 0, falhas: 0 });
    expect(resumo.resultados[0]).toMatchObject({
      nome: 'Netflix',
      cicloCobranca: '2026-10-05',
      status: 'sent',
    });
    expect(transporter.sendMail).toHaveBeenCalledOnce();
  });

  it('não envia nada quando não há cobranças próximas', async () => {
    inserirAssinatura({ nome: 'Spotify', data_cobranca: '2026-01-20' });
    const transporter = criarTransporterFalso();

    const resumo = await executarJobNotificacoes({ referencia: REFERENCIA, transporter });

    expect(resumo).toMatchObject({ encontradas: 0, enviadas: 0, ignoradas: 0, falhas: 0 });
    expect(resumo.resultados).toEqual([]);
    expect(transporter.sendMail).not.toHaveBeenCalled();
    expect(db.prepare('SELECT COUNT(*) AS total FROM notification_deliveries').get().total).toBe(0);
  });

  it('é idempotente: rodar duas vezes no mesmo ciclo ignora o segundo envio', async () => {
    inserirAssinatura({ nome: 'Netflix', data_cobranca: '2026-01-05' });
    const transporter = criarTransporterFalso();

    const primeira = await executarJobNotificacoes({ referencia: REFERENCIA, transporter });
    const segunda = await executarJobNotificacoes({ referencia: REFERENCIA, transporter });

    expect(primeira.enviadas).toBe(1);
    expect(segunda).toMatchObject({ encontradas: 1, enviadas: 0, ignoradas: 1, falhas: 0 });
    expect(segunda.resultados[0]).toMatchObject({ status: 'skipped', motivo: 'sent' });
    expect(transporter.sendMail).toHaveBeenCalledOnce();
  });

  it('registra falha (status failed + erro) quando o sendMail rejeita', async () => {
    const assinatura = inserirAssinatura({ nome: 'Netflix', data_cobranca: '2026-01-05' });
    const transporter = { sendMail: vi.fn().mockRejectedValue(new Error('SMTP indisponível')) };

    const resumo = await executarJobNotificacoes({ referencia: REFERENCIA, transporter });
    const entrega = db.prepare('SELECT * FROM notification_deliveries WHERE subscription_id = ?')
      .get(assinatura.id);

    expect(resumo).toMatchObject({ encontradas: 1, enviadas: 0, falhas: 1 });
    expect(resumo.resultados[0]).toMatchObject({ status: 'failed', erro: 'SMTP indisponível' });
    expect(entrega).toMatchObject({ status: 'failed', erro: 'SMTP indisponível' });
  });

describe('POST /notifications/test-run', () => {
  it.todo('executa o job em dry-run e responde 200 com o resumo');
  it.todo('aceita "date" e "diasAlerta" no corpo ou na query string');
  it.todo('responde 400 quando "date" é inválido');
  it.todo('responde 400 quando "diasAlerta" não é um inteiro >= 0');
  it.todo('responde 500 com o resumo quando algum lembrete falha');
});

// Já importado para os casos acima: api.
