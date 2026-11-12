// Área 4 — Job de notificações · US4
// Alvo: executarJobNotificacoes (src/services/notificationService.js)
//       src/repositories/notificationRepository.js
//       POST /notifications/test-run (notificationsController)
//
// Teste de INTEGRAÇÃO: o job roda de verdade contra o SQLite de teste; só o
// envio do e-mail é um dublê injetado por parâmetro.
// Para implementar um caso, troque `it.todo('...')` por `it('...', async () => { ... })`.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../helpers/api.js';
import { inserirAssinatura, limparBanco } from '../helpers/banco.js';
import { executarJobNotificacoes } from '../../src/services/notificationService.js';

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

  it.todo('não envia nada quando não há cobranças próximas');
  it.todo('é idempotente: rodar duas vezes no mesmo ciclo ignora o segundo envio');
  it.todo('registra falha (status failed + erro) quando o sendMail rejeita');
  it.todo('tenta de novo no mesmo ciclo quando a entrega anterior falhou');
  it.todo('marca todas como falha quando o SMTP não está configurado e não há transporter');
  it.todo('respeita o parâmetro diasAlerta');
});

describe('POST /notifications/test-run', () => {
  it.todo('executa o job em dry-run e responde 200 com o resumo');
  it.todo('aceita "date" e "diasAlerta" no corpo ou na query string');
  it.todo('responde 400 quando "date" é inválido');
  it.todo('responde 400 quando "diasAlerta" não é um inteiro >= 0');
  it.todo('responde 500 com o resumo quando algum lembrete falha');
});

// Já importado para os casos acima: api.
