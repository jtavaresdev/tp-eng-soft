// Área 3 — Resumo e estatísticas · US3, US7, US8
// Alvo: calcularHistoricoMensal, calcularResumoMensal e calcularGastosPorCategoria
//       em src/services/subscriptionsService.js
//
// Teste de UNIDADE com MOCK do repositório: o serviço recebe os dados que o
// teste definir, sem consultar o banco. Bom para cobrir as regras de cálculo.
// Para implementar um caso, troque `it.todo('...')` por `it('...', async () => { ... })`.
import { describe, expect, it, vi } from 'vitest';
import {
  getAssinaturasParaHistorico,
  getResumoAssinaturasAtivas,
  getTotaisPorCategoriaAtivas,
} from '../../src/repositories/subscriptionRepository.js';
import {
  calcularGastosPorCategoria,
  calcularHistoricoMensal,
  calcularResumoMensal,
} from '../../src/services/subscriptionsService.js';

// Sem fábrica: todas as funções do módulo viram vi.fn().
vi.mock('../../src/repositories/subscriptionRepository.js');

// Dia 15 evita qualquer efeito de fuso horário na virada do mês.
const OUTUBRO_2026 = new Date(2026, 9, 15);

describe('calcularHistoricoMensal', () => {
  // Exemplo pronto
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

  it.todo('retorna 12 meses zerados quando não há assinaturas');
  it.todo('soma várias assinaturas ativas no mesmo mês');
  it.todo('conta a assinatura cancelada só até o mês anterior ao cancelamento');
  it.todo('usa criado_em quando data_inicio é nula');
  it.todo('ignora assinatura cancelada sem cancelado_em');
  it.todo('aceita valor como Decimal do Prisma (objeto com toNumber)');
  it.todo('arredonda o total do mês para 2 casas decimais');
});

describe('calcularResumoMensal', () => {
  it.todo('retorna totalMensal e quantidadeAtivas a partir do repositório');
  it.todo('retorna totalMensal 0 quando a soma vem nula');
});

describe('calcularGastosPorCategoria', () => {
  it.todo('retorna todas as categorias válidas, com 0 nas que não têm gasto');
  it.todo('mantém a ordem de CATEGORIAS_VALIDAS');
});

// Já importados para os casos acima: getResumoAssinaturasAtivas,
// getTotaisPorCategoriaAtivas, calcularResumoMensal, calcularGastosPorCategoria.
