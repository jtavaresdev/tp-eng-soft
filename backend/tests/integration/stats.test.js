// Área 3 — Resumo e estatísticas · US3, US7, US8
// Alvo: GET /subscriptions/summary
//       GET /stats/by-category
//       GET /stats/monthly-evolution
//       -> controllers -> subscriptionsService -> subscriptionRepository (Prisma)
//
// Teste de INTEGRAÇÃO: requisição HTTP real + consultas reais no SQLite de teste.
// Para implementar um caso, troque `it.todo('...')` por `it('...', async () => { ... })`.
import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '../helpers/api.js';
import { inserirAssinatura, limparBanco } from '../helpers/banco.js';

beforeEach(limparBanco);

describe('GET /subscriptions/summary', () => {
  // Exemplo pronto
  it('soma o valor das assinaturas ativas e ignora as canceladas', async () => {
    inserirAssinatura({ nome: 'Netflix', valor: 39.9 });
    inserirAssinatura({ nome: 'Spotify', valor: 21.9 });
    inserirAssinatura({
      nome: 'Antiga',
      valor: 100,
      status: 'cancelado',
      cancelado_em: '2026-06-10 10:00:00',
    });

    const resposta = await api.get('/subscriptions/summary');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ totalMensal: 61.8, quantidadeAtivas: 2 });
  });

  it.todo('retorna total 0 e quantidade 0 quando não há assinaturas');
});

describe('GET /stats/by-category', () => {
  it.todo('retorna as 5 categorias zeradas quando não há assinaturas');
  it.todo('soma os valores por categoria considerando só as ativas');
});

describe('GET /stats/monthly-evolution', () => {
  it.todo('retorna 12 itens no formato { mes: "AAAA-MM", total } terminando no mês atual');
  it.todo('reflete uma assinatura recém-criada no mês atual');
  it.todo('deixa de contar a assinatura cancelada a partir do mês do cancelamento');
});

describe('erros', () => {
  // Dica: vi.mock('../../src/repositories/subscriptionRepository.js') em um
  // arquivo separado, fazendo a consulta rejeitar.
  it.todo('responde 500 no formato { error } quando a consulta falha (summary e stats)');
});
