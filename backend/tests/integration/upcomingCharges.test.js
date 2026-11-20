// Área 2 — Datas, próximas cobranças e e-mail · US4
// Alvo: GET  /subscriptions/upcoming-charges
//       POST /subscriptions/notify-upcoming
//       -> subscriptionsController -> buscarProximasCobrancas -> Prisma/SQLite
//
// Teste de INTEGRAÇÃO. O envio de e-mail é substituído por um dublê
// (vi.mock), todo o resto roda de verdade.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../helpers/api.js';
import { inserirAssinatura, limparBanco } from '../helpers/banco.js';
import { enviarLembrete } from '../../src/services/mail/emailService.js';

vi.mock('../../src/services/mail/emailService.js', () => ({ enviarLembrete: vi.fn() }));

beforeEach(() => {
  limparBanco();
  enviarLembrete.mockReset().mockResolvedValue({ sucesso: true, messageId: 'msg-123' });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

// Simula só o relógio (Date). Os timers reais continuam rodando, senão o
// servidor HTTP e o SQLite poderiam travar esperando um setImmediate/setTimeout.
function fixarHoje(dataISO) {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(`${dataISO}T12:00:00Z`));
}

describe('GET /subscriptions/upcoming-charges', () => {
  it('retorna a assinatura cuja cobrança cai dentro da janela de alerta', async () => {
    inserirAssinatura({ nome: 'Netflix', valor: 39.9, data_cobranca: '2026-01-05' });

    // Cobrança todo dia 5; consultando em 03/10 faltam 2 dias (janela = 3).
    const resposta = await api.get('/subscriptions/upcoming-charges?date=2026-10-03');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual([
      { id: 1, nome: 'Netflix', valor: 39.9, proximaCobranca: '2026-10-05', diasRestantes: 2 },
    ]);
  });

  it('não retorna assinaturas cuja cobrança está fora da janela', async () => {
    inserirAssinatura({ nome: 'Netflix', valor: 39.9, data_cobranca: '2026-01-05' });
    inserirAssinatura({ nome: 'Spotify', valor: 21.9, data_cobranca: '2026-01-20' });

    // Em 03/10: Netflix (dia 5) está a 2 dias; Spotify (dia 20) a 17 dias.
    const resposta = await api.get('/subscriptions/upcoming-charges?date=2026-10-03');

    expect(resposta.status).toBe(200);
    expect(resposta.body.map((item) => item.nome)).toEqual(['Netflix']);
  });

  it('não retorna a assinatura quando faltam mais dias do que a janela (4 > 3)', async () => {
    inserirAssinatura({ nome: 'Netflix', data_cobranca: '2026-01-05' });

    const resposta = await api.get('/subscriptions/upcoming-charges?date=2026-10-01');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual([]);
  });

  it('inclui a assinatura que vence no próprio dia (diasRestantes = 0)', async () => {
    inserirAssinatura({ nome: 'Netflix', valor: 39.9, data_cobranca: '2026-01-05' });

    const resposta = await api.get('/subscriptions/upcoming-charges?date=2026-10-05');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual([
      { id: 1, nome: 'Netflix', valor: 39.9, proximaCobranca: '2026-10-05', diasRestantes: 0 },
    ]);
  });

  it('não retorna assinaturas canceladas', async () => {
    inserirAssinatura({
      nome: 'Cancelada',
      data_cobranca: '2026-01-05',
      status: 'cancelado',
      cancelado_em: '2026-05-01 10:00:00',
    });
    inserirAssinatura({ nome: 'Ativa', data_cobranca: '2026-01-05' });

    const resposta = await api.get('/subscriptions/upcoming-charges?date=2026-10-03');

    expect(resposta.status).toBe(200);
    expect(resposta.body.map((item) => item.nome)).toEqual(['Ativa']);
  });

  it.each(['25/02/2026', '2026-2-5', '2026-02-30'])(
    'responde 400 quando "date" não está no formato AAAA-MM-DD (%s)',
    async (dataInvalida) => {
      const resposta = await api.get('/subscriptions/upcoming-charges').query({ date: dataInvalida });

      expect(resposta.status).toBe(400);
      expect(resposta.body).toHaveProperty('error');
    },
  );

  it('usa a data de hoje quando "date" não é informado (vi.useFakeTimers)', async () => {
    inserirAssinatura({ nome: 'Netflix', valor: 39.9, data_cobranca: '2026-01-05' });
    fixarHoje('2026-10-03');

    const resposta = await api.get('/subscriptions/upcoming-charges');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual([
      { id: 1, nome: 'Netflix', valor: 39.9, proximaCobranca: '2026-10-05', diasRestantes: 2 },
    ]);
  });

  it('respeita NOTIFY_DAYS_BEFORE (vi.stubEnv)', async () => {
    vi.stubEnv('NOTIFY_DAYS_BEFORE', '1');
    inserirAssinatura({ nome: 'Netflix', data_cobranca: '2026-01-05' });

    // Janela de 1 dia: a 2 dias de distância já fica de fora; a 1 dia entra.
    const aDoisDias = await api.get('/subscriptions/upcoming-charges?date=2026-10-03');
    const aUmDia = await api.get('/subscriptions/upcoming-charges?date=2026-10-04');

    expect(aDoisDias.body).toEqual([]);
    expect(aUmDia.body.map((item) => item.nome)).toEqual(['Netflix']);
  });

  it('cai no padrão 3 se NOTIFY_DAYS_BEFORE for inválido', async () => {
    vi.stubEnv('NOTIFY_DAYS_BEFORE', 'abc');
    inserirAssinatura({ nome: 'Netflix', data_cobranca: '2026-01-05' });

    const aDoisDias = await api.get('/subscriptions/upcoming-charges?date=2026-10-03');
    const aQuatroDias = await api.get('/subscriptions/upcoming-charges?date=2026-10-01');

    expect(aDoisDias.body.map((item) => item.nome)).toEqual(['Netflix']);
    expect(aQuatroDias.body).toEqual([]);
  });
});

describe('POST /subscriptions/notify-upcoming', () => {
  beforeEach(() => {
    // O endpoint usa "hoje": fixamos o relógio em 03/10/2026.
    fixarHoje('2026-10-03');
  });

  it('chama enviarLembrete uma vez para cada cobrança próxima e responde 200', async () => {
    inserirAssinatura({ nome: 'Netflix', valor: 39.9, data_cobranca: '2026-01-05' }); // em 2 dias
    inserirAssinatura({ nome: 'Spotify', valor: 21.9, data_cobranca: '2026-01-04' }); // em 1 dia
    inserirAssinatura({ nome: 'Academia', valor: 99.9, data_cobranca: '2026-01-25' }); // fora da janela

    const resposta = await api.post('/subscriptions/notify-upcoming');

    expect(resposta.status).toBe(200);
    expect(resposta.body.quantidade).toBe(2);
    expect(enviarLembrete).toHaveBeenCalledTimes(2);

    const nomesNotificados = enviarLembrete.mock.calls.map(([assinatura]) => assinatura.nome).sort();
    expect(nomesNotificados).toEqual(['Netflix', 'Spotify']);
    expect(enviarLembrete).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'Netflix', valor: 39.9 }),
    );
  });

  it('responde quantidade 0 quando não há cobranças próximas', async () => {
    inserirAssinatura({ nome: 'Academia', data_cobranca: '2026-01-25' }); // 22 dias

    const resposta = await api.post('/subscriptions/notify-upcoming');

    expect(resposta.status).toBe(200);
    expect(resposta.body.quantidade).toBe(0);
    expect(enviarLembrete).not.toHaveBeenCalled();
  });

  it('repassa o resultado de falha do envio no item correspondente', async () => {
    inserirAssinatura({ nome: 'Netflix', data_cobranca: '2026-01-05' });
    enviarLembrete.mockResolvedValue({ sucesso: false, erro: 'SMTP fora do ar' });

    const resposta = await api.post('/subscriptions/notify-upcoming');

    expect(resposta.status).toBe(200);

    // O guia não fixa o nome do campo da lista; procuramos o array no corpo.
    const itens = Object.values(resposta.body).find(Array.isArray);
    expect(itens).toHaveLength(1);

    const item = JSON.stringify(itens[0]);
    expect(item).toContain('Netflix');
    expect(item).toContain('SMTP fora do ar');
  });

  it('responde 500 quando enviarLembrete lança erro', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    inserirAssinatura({ nome: 'Netflix', data_cobranca: '2026-01-05' });
    enviarLembrete.mockRejectedValue(new Error('falha inesperada'));

    const resposta = await api.post('/subscriptions/notify-upcoming');

    expect(resposta.status).toBe(500);
  });
});