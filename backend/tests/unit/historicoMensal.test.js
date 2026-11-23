// Área 3 — Resumo e estatísticas · US3, US7, US8
// Alvo: calcularHistoricoMensal, calcularResumoMensal e calcularGastosPorCategoria
//       em src/services/subscriptionsService.js
//
// Teste de UNIDADE com MOCK do repositório: o serviço recebe os dados que o
// teste definir, sem consultar o banco. Bom para cobrir as regras de cálculo.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getAssinaturasParaHistorico,
  getResumoAssinaturasAtivas,
  getTotaisPorCategoriaAtivas,
} from '../../src/repositories/subscriptionRepository.js';
import {
  CATEGORIAS_VALIDAS,
  calcularGastosPorCategoria,
  calcularHistoricoMensal,
  calcularResumoMensal,
} from '../../src/services/subscriptionsService.js';

// Sem fábrica: todas as funções do módulo viram vi.fn().
vi.mock('../../src/repositories/subscriptionRepository.js');

// Dia 15 evita qualquer efeito de fuso horário na virada do mês.
const OUTUBRO_2026 = new Date(2026, 9, 15);

beforeEach(() => vi.resetAllMocks());

function assinatura(sobrescritas = {}) {
  return { valor: 20, status: 'ativo', data_inicio: '2026-08-10',
    criado_em: '2026-07-10', cancelado_em: null, ...sobrescritas };
}

describe('calcularHistoricoMensal', () => {
  it('devolve 12 meses e soma a assinatura só a partir do mês de início', async () => {
    getAssinaturasParaHistorico.mockResolvedValue([
      {
        valor: 20,
        status: 'ativo',
        data_inicio: new Date('2026-08-10T00:00:00Z'),
        criado_em: new Date('2026-08-10T00:00:00Z'),
        cancelado_em: null,
      },
    ]);

    const historico = await calcularHistoricoMensal(OUTUBRO_2026);

    expect(historico).toHaveLength(12);
    expect(historico[0].mes).toBe('2025-11');
    expect(historico.at(-1)).toEqual({ mes: '2026-10', total: 20 });
    expect(historico.find(({ mes }) => mes === '2026-07').total).toBe(0);
    expect(historico.find(({ mes }) => mes === '2026-08').total).toBe(20);
  });

  it('retorna 12 meses zerados quando não há assinaturas', async () => {
    getAssinaturasParaHistorico.mockResolvedValue([]);
    const historico = await calcularHistoricoMensal(OUTUBRO_2026);
    expect(historico.map(({ mes }) => mes)).toEqual(['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10']);
    expect(historico.every(({ total }) => total === 0)).toBe(true);
  });
  it('soma várias assinaturas ativas no mesmo mês', async () => {
    getAssinaturasParaHistorico.mockResolvedValue([assinatura(), assinatura({ valor: 35, data_inicio: '2026-09-15' })]);
    const historico = await calcularHistoricoMensal(OUTUBRO_2026);
    expect(historico.slice(-3)).toEqual([{ mes: '2026-08', total: 20 }, { mes: '2026-09', total: 55 }, { mes: '2026-10', total: 55 }]);
  });
  it('conta a assinatura cancelada só até o mês anterior ao cancelamento', async () => {
    getAssinaturasParaHistorico.mockResolvedValue([assinatura({ status: 'cancelado', cancelado_em: '2026-09-15' })]);
    const historico = await calcularHistoricoMensal(OUTUBRO_2026);
    expect(historico.slice(-3)).toEqual([{ mes: '2026-08', total: 20 }, { mes: '2026-09', total: 0 }, { mes: '2026-10', total: 0 }]);
  });
  it('usa criado_em quando data_inicio é nula', async () => {
    getAssinaturasParaHistorico.mockResolvedValue([assinatura({ data_inicio: null })]);
    const historico = await calcularHistoricoMensal(OUTUBRO_2026);
    expect(historico.find(({ mes }) => mes === '2026-06').total).toBe(0);
    expect(historico.find(({ mes }) => mes === '2026-07').total).toBe(20);
  });
  it('ignora assinatura cancelada sem cancelado_em', async () => {
    getAssinaturasParaHistorico.mockResolvedValue([assinatura({ status: 'cancelado' })]);
    expect((await calcularHistoricoMensal(OUTUBRO_2026)).every(({ total }) => total === 0)).toBe(true);
  });
  it('aceita valor como Decimal do Prisma (objeto com toNumber)', async () => {
    getAssinaturasParaHistorico.mockResolvedValue([assinatura({ valor: { toNumber: () => 39.9 } })]);
    expect((await calcularHistoricoMensal(OUTUBRO_2026)).at(-1)).toEqual({ mes: '2026-10', total: 39.9 });
  });
  it('arredonda o total do mês para 2 casas decimais', async () => {
    getAssinaturasParaHistorico.mockResolvedValue([assinatura({ valor: 10.124 }), assinatura({ valor: 20.234 })]);
    expect((await calcularHistoricoMensal(OUTUBRO_2026)).at(-1).total).toBe(30.36);
  });
});

describe('calcularResumoMensal', () => {
  it('retorna totalMensal e quantidadeAtivas a partir do repositório', async () => {
    getResumoAssinaturasAtivas.mockResolvedValue({ somaValor: 61.899, quantidade: 2 });
    expect(await calcularResumoMensal()).toEqual({ totalMensal: 61.9, quantidadeAtivas: 2 });
  });
  it('retorna totalMensal 0 quando a soma vem nula', async () => {
    getResumoAssinaturasAtivas.mockResolvedValue({ somaValor: null, quantidade: 0 });
    expect(await calcularResumoMensal()).toEqual({ totalMensal: 0, quantidadeAtivas: 0 });
  });
});

describe('calcularGastosPorCategoria', () => {
  it('retorna todas as categorias válidas, com 0 nas que não têm gasto', async () => {
    getTotaisPorCategoriaAtivas.mockResolvedValue([{ categoria: 'streaming', _sum: { valor: 39.999 } }, { categoria: 'jogos', _sum: { valor: null } }]);
    expect(await calcularGastosPorCategoria()).toEqual([{ categoria: 'streaming', total: 40 }, { categoria: 'produtividade', total: 0 }, { categoria: 'jogos', total: 0 }, { categoria: 'academia', total: 0 }, { categoria: 'outros', total: 0 }]);
  });
  it('mantém a ordem de CATEGORIAS_VALIDAS', async () => {
    getTotaisPorCategoriaAtivas.mockResolvedValue([...CATEGORIAS_VALIDAS].reverse().map((categoria) => ({ categoria, _sum: { valor: 10 } })));
    expect((await calcularGastosPorCategoria()).map(({ categoria }) => categoria)).toEqual(CATEGORIAS_VALIDAS);
  });
});
