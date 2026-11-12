// Área 2 — Datas, próximas cobranças e e-mail · US4
// Alvo: GET  /subscriptions/upcoming-charges
//       POST /subscriptions/notify-upcoming
//       -> subscriptionsController -> buscarProximasCobrancas -> Prisma/SQLite
//
// Teste de INTEGRAÇÃO. O envio de e-mail é substituído por um dublê
// (vi.mock), todo o resto roda de verdade.
// Para implementar um caso, troque `it.todo('...')` por `it('...', async () => { ... })`.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../helpers/api.js';
import { inserirAssinatura, limparBanco } from '../helpers/banco.js';
import { enviarLembrete } from '../../src/services/mail/emailService.js';

vi.mock('../../src/services/mail/emailService.js', () => ({ enviarLembrete: vi.fn() }));

beforeEach(() => {
  limparBanco();
  enviarLembrete.mockReset().mockResolvedValue({ sucesso: true, messageId: 'msg-123' });
});

describe('GET /subscriptions/upcoming-charges', () => {
  // Exemplo pronto
  it('retorna a assinatura cuja cobrança cai dentro da janela de alerta', async () => {
    inserirAssinatura({ nome: 'Netflix', valor: 39.9, data_cobranca: '2026-01-05' });

    // Cobrança todo dia 5; consultando em 03/10 faltam 2 dias (janela = 3).
    const resposta = await api.get('/subscriptions/upcoming-charges?date=2026-10-03');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual([
      { id: 1, nome: 'Netflix', valor: 39.9, proximaCobranca: '2026-10-05', diasRestantes: 2 },
    ]);
  });

  it.todo('não retorna assinaturas cuja cobrança está fora da janela');
  it.todo('inclui a assinatura que vence no próprio dia (diasRestantes = 0)');
  it.todo('não retorna assinaturas canceladas');
  it.todo('responde 400 quando "date" não está no formato AAAA-MM-DD');
  it.todo('usa a data de hoje quando "date" não é informado (vi.useFakeTimers)');
  it.todo('respeita NOTIFY_DAYS_BEFORE (vi.stubEnv) e cai no padrão 3 se for inválido');
});

describe('POST /subscriptions/notify-upcoming', () => {
  it.todo('chama enviarLembrete uma vez para cada cobrança próxima e responde 200');
  it.todo('responde quantidade 0 quando não há cobranças próximas');
  it.todo('repassa o resultado de falha do envio no item correspondente');
  it.todo('responde 500 quando enviarLembrete lança erro');
});
