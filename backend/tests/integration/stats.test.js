// Área 3 — HTTP + SQLite real, conforme docs/testes.md.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../helpers/api.js';
import { inserirAssinatura, limparBanco } from '../helpers/banco.js';

beforeEach(() => {
  limparBanco();
  // Só Date é substituído: os timers de HTTP e do Prisma continuam reais.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-15T12:00:00Z'));
});
afterEach(() => vi.useRealTimers());

describe('GET /subscriptions/summary', () => {
  it('soma o valor das assinaturas ativas e ignora as canceladas', async () => {
    inserirAssinatura({ nome: 'Netflix', valor: 39.9 });
    inserirAssinatura({ nome: 'Spotify', valor: 21.9 });
    inserirAssinatura({ nome: 'Antiga', valor: 100, status: 'cancelado', cancelado_em: '2026-06-10 10:00:00' });
    const resposta = await api.get('/subscriptions/summary');
    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ totalMensal: 61.8, quantidadeAtivas: 2 });
  });

  it('retorna total 0 e quantidade 0 quando não há assinaturas', async () => {
    const resposta = await api.get('/subscriptions/summary');
    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ totalMensal: 0, quantidadeAtivas: 0 });
  });
});

const categoriasZeradas = [
  { categoria: 'streaming', total: 0 },
  { categoria: 'produtividade', total: 0 },
  { categoria: 'jogos', total: 0 },
  { categoria: 'academia', total: 0 },
  { categoria: 'outros', total: 0 },
];

describe('GET /stats/by-category', () => {
  it('retorna as 5 categorias zeradas quando não há assinaturas', async () => {
    const resposta = await api.get('/stats/by-category');
    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual(categoriasZeradas);
  });

  it('soma os valores por categoria considerando só as ativas', async () => {
    inserirAssinatura({ valor: 39.9 });
    inserirAssinatura({ valor: 21.9 });
    inserirAssinatura({ categoria: 'jogos', valor: 15 });
    inserirAssinatura({ categoria: 'jogos', valor: 100, status: 'cancelado', cancelado_em: '2026-09-10 12:00:00' });
    const resposta = await api.get('/stats/by-category');
    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual(categoriasZeradas.map((item) => ({
      ...item, total: item.categoria === 'streaming' ? 61.8 : item.categoria === 'jogos' ? 15 : 0,
    })));
    const resumo = await api.get('/subscriptions/summary');
    expect(resumo.status).toBe(200);
    expect(resposta.body.reduce((soma, item) => soma + item.total, 0)).toBe(resumo.body.totalMensal);
  });
});

describe('GET /stats/monthly-evolution', () => {
  it('retorna 12 itens zerados terminando no mês atual quando não há assinaturas', async () => {
    const resposta = await api.get('/stats/monthly-evolution');
    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual([
      '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04',
      '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10',
    ].map((mes) => ({ mes, total: 0 })));
  });

  it('reflete uma assinatura recém-criada apenas a partir do mês de início', async () => {
    inserirAssinatura({ valor: 39.9, data_inicio: '2026-10-10', criado_em: '2026-10-10 12:00:00' });
    const resposta = await api.get('/stats/monthly-evolution');
    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveLength(12);
    expect(resposta.body.slice(0, -1).every(({ total }) => total === 0)).toBe(true);
    expect(resposta.body.at(-1)).toEqual({ mes: '2026-10', total: 39.9 });
  });

  it('deixa de contar a assinatura cancelada a partir do mês do cancelamento', async () => {
    inserirAssinatura({ valor: 20, data_inicio: '2026-08-10', status: 'cancelado', cancelado_em: '2026-09-15 12:00:00' });
    inserirAssinatura({ valor: 10, data_inicio: '2026-08-10' });
    const resposta = await api.get('/stats/monthly-evolution');
    expect(resposta.status).toBe(200);
    expect(resposta.body.slice(-4)).toEqual([
      { mes: '2026-07', total: 0 }, { mes: '2026-08', total: 30 },
      { mes: '2026-09', total: 10 }, { mes: '2026-10', total: 10 },
    ]);
  });
});
