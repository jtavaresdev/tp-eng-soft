// Falhas isoladas do repositório; os cenários de sucesso usam SQLite real.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../helpers/api.js';
import { limparBanco } from '../helpers/banco.js';
import {
  getResumoAssinaturasAtivas,
  getTotaisPorCategoriaAtivas,
  getAssinaturasParaHistorico,
} from '../../src/repositories/subscriptionRepository.js';

vi.mock('../../src/repositories/subscriptionRepository.js');
beforeEach(() => {
  limparBanco();
  vi.resetAllMocks();
});

describe('erros das consultas de resumo e estatísticas', () => {
  it.each([
    ['/subscriptions/summary', getResumoAssinaturasAtivas, 'Não foi possível calcular o resumo das assinaturas.'],
    ['/stats/by-category', getTotaisPorCategoriaAtivas, 'Não foi possível calcular os gastos por categoria.'],
    ['/stats/monthly-evolution', getAssinaturasParaHistorico, 'Não foi possível calcular o histórico mensal de gastos.'],
  ])('GET %s responde 500 sem expor detalhes internos', async (rota, consulta, mensagem) => {
    const falha = new Error('Falha interna na conexão com o banco');
    consulta.mockRejectedValueOnce(falha);
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const resposta = await api.get(rota);
    expect(resposta.status).toBe(500);
    expect(resposta.body).toEqual({ error: mensagem });
    expect(consulta).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith(expect.any(String), falha);
  });
});
