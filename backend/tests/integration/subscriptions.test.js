// Área 1 — Assinaturas (CRUD) · US1, US2, US5, US6
// Alvo: rotas /subscriptions (POST, GET, PUT, DELETE, PATCH cancel)
//       -> subscriptionsController -> subscriptionsService -> SQLite
//
// Teste de INTEGRAÇÃO: requisição HTTP real no app + banco SQLite de teste.
// Para implementar um caso, troque `it.todo('...')` por `it('...', async () => { ... })`.
import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '../helpers/api.js';
import { dadosAssinatura, limparBanco } from '../helpers/banco.js';

beforeEach(limparBanco);

describe('POST /subscriptions', () => {
  // Exemplo pronto
  it('cria a assinatura e ela passa a aparecer na listagem', async () => {
    const criacao = await api.post('/subscriptions').send(dadosAssinatura({ nome: 'Spotify' }));

    expect(criacao.status).toBe(201);
    expect(criacao.body).toMatchObject({ nome: 'Spotify', valor: 39.9, status: 'ativo' });
    expect(criacao.body.id).toEqual(expect.any(Number));

    const listagem = await api.get('/subscriptions');
    expect(listagem.body.map((assinatura) => assinatura.nome)).toEqual(['Spotify']);
  });

  it.todo('responde 400 com a mensagem do primeiro erro quando o payload é inválido');
  it.todo('responde 400 quando o corpo vem vazio');
  it.todo('remove espaços do início e do fim do nome ao salvar');
});

describe('GET /subscriptions', () => {
  it.todo('retorna lista vazia quando não há assinaturas');
  it.todo('lista só as ativas por padrão');
  it.todo('lista as canceladas com ?status=cancelado');
  it.todo('ordena pela data de cobrança');
});

describe('PUT /subscriptions/:id', () => {
  it.todo('atualiza os dados e responde 200 com a assinatura atualizada');
  it.todo('responde 400 quando o payload é inválido');
  it.todo('responde 404 quando o id não existe');
  it.todo('responde 404 quando o id não é um inteiro positivo (ex: "abc", "0")');
});

describe('DELETE /subscriptions/:id', () => {
  it.todo('marca como cancelada, preenche cancelado_em e some da listagem de ativas');
  it.todo('responde 404 ao cancelar uma assinatura já cancelada');
  it.todo('responde 404 quando o id não existe ou é inválido');
});

describe('PATCH /subscriptions/:id/cancel', () => {
  it.todo('tem o mesmo efeito do DELETE');
});
