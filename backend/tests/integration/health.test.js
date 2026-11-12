// EXEMPLO COMPLETO de teste de integração (HTTP -> Express).
// Use este arquivo como referência de formato para os demais.
import { describe, expect, it } from 'vitest';
import { api } from '../helpers/api.js';

describe('GET /health', () => {
  it('responde 200 com status ok', async () => {
    const resposta = await api.get('/health');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ status: 'ok' });
  });
});

describe('rota inexistente', () => {
  it('responde 404 no formato padrão de erro', async () => {
    const resposta = await api.get('/nao-existe');

    expect(resposta.status).toBe(404);
    expect(resposta.body).toEqual({ error: 'Rota não encontrada' });
  });
});
