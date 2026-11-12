// Área 1 — Assinaturas (CRUD) · US1, US2, US5, US6
// Alvo: rotas /subscriptions (POST, GET, PUT, DELETE, PATCH cancel)
//       -> subscriptionsController -> subscriptionsService -> SQLite
//
// Teste de INTEGRAÇÃO: requisição HTTP real no app + banco SQLite de teste.
import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '../helpers/api.js';
import { dadosAssinatura, limparBanco } from '../helpers/banco.js';

const ERRO_NAO_ENCONTRADA = { error: 'Assinatura não encontrada' };

async function criar(sobrescritas = {}) {
  const resposta = await api.post('/subscriptions').send(dadosAssinatura(sobrescritas));
  expect(resposta.status).toBe(201);
  return resposta.body;
}

async function nomesListados(query = '') {
  const resposta = await api.get(`/subscriptions${query}`);
  expect(resposta.status).toBe(200);
  return resposta.body.map((assinatura) => assinatura.nome);
}

beforeEach(limparBanco);

describe('POST /subscriptions', () => {
  it('cria a assinatura e ela passa a aparecer na listagem', async () => {
    const criacao = await api.post('/subscriptions').send(dadosAssinatura({ nome: 'Spotify' }));

    expect(criacao.status).toBe(201);
    expect(criacao.body).toMatchObject({ nome: 'Spotify', valor: 39.9, status: 'ativo' });
    expect(criacao.body.id).toEqual(expect.any(Number));

    const listagem = await api.get('/subscriptions');
    expect(listagem.body.map((assinatura) => assinatura.nome)).toEqual(['Spotify']);
  });

  it('devolve todos os campos salvos, com cancelado_em nulo', async () => {
    const assinatura = await criar();

    expect(assinatura).toMatchObject({
      ...dadosAssinatura(),
      status: 'ativo',
      cancelado_em: null,
    });
    expect(assinatura.criado_em).toEqual(expect.any(String));
  });

  it('responde 400 com a mensagem do primeiro erro quando o payload é inválido', async () => {
    const resposta = await api
      .post('/subscriptions')
      .send(dadosAssinatura({ valor: 0, categoria: 'musica' }));

    expect(resposta.status).toBe(400);
    expect(resposta.body).toEqual({ error: "O campo 'valor' deve ser maior que zero" });
    expect(await nomesListados()).toEqual([]);
  });

  it('responde 400 quando o corpo vem vazio', async () => {
    const semCorpo = await api.post('/subscriptions');
    const objetoVazio = await api.post('/subscriptions').send({});

    for (const resposta of [semCorpo, objetoVazio]) {
      expect(resposta.status).toBe(400);
      expect(resposta.body).toEqual({ error: "O campo 'nome' é obrigatório" });
    }
  });

  it('remove espaços do início e do fim do nome ao salvar', async () => {
    const assinatura = await criar({ nome: '  Spotify  ' });

    expect(assinatura.nome).toBe('Spotify');
  });
});

describe('GET /subscriptions', () => {
  it('retorna lista vazia quando não há assinaturas', async () => {
    const resposta = await api.get('/subscriptions');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual([]);
  });

  it('lista só as ativas por padrão', async () => {
    await criar({ nome: 'Netflix' });
    const cancelada = await criar({ nome: 'Spotify' });
    await api.delete(`/subscriptions/${cancelada.id}`);

    expect(await nomesListados()).toEqual(['Netflix']);
  });

  it('lista as canceladas com ?status=cancelado', async () => {
    await criar({ nome: 'Netflix' });
    const cancelada = await criar({ nome: 'Spotify' });
    await api.delete(`/subscriptions/${cancelada.id}`);

    expect(await nomesListados('?status=cancelado')).toEqual(['Spotify']);
  });

  it('ordena pela data de cobrança', async () => {
    await criar({ nome: 'Dia 20', data_cobranca: '2026-10-20' });
    await criar({ nome: 'Dia 05', data_cobranca: '2026-10-05' });
    await criar({ nome: 'Dia 12', data_cobranca: '2026-10-12' });

    expect(await nomesListados()).toEqual(['Dia 05', 'Dia 12', 'Dia 20']);
  });
});

describe('PUT /subscriptions/:id', () => {
  it('atualiza os dados e responde 200 com a assinatura atualizada', async () => {
    const original = await criar({ nome: 'Netflix', valor: 39.9 });
    const novosDados = dadosAssinatura({
      nome: '  Netflix 4K  ',
      valor: 55.9,
      data_cobranca: '2026-10-15',
      data_inicio: '2026-02-01',
      categoria: 'outros',
    });

    const resposta = await api.put(`/subscriptions/${original.id}`).send(novosDados);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({
      ...novosDados,
      id: original.id,
      nome: 'Netflix 4K',
      status: 'ativo',
    });

    const listagem = await api.get('/subscriptions');
    expect(listagem.body).toEqual([resposta.body]);
  });

  it('responde 400 quando o payload é inválido e não altera a assinatura', async () => {
    const original = await criar({ nome: 'Netflix' });

    const resposta = await api
      .put(`/subscriptions/${original.id}`)
      .send(dadosAssinatura({ nome: '' }));

    expect(resposta.status).toBe(400);
    expect(resposta.body).toEqual({ error: "O campo 'nome' é obrigatório" });
    expect(await nomesListados()).toEqual(['Netflix']);
  });

  it('responde 404 quando o id não existe', async () => {
    const resposta = await api.put('/subscriptions/999').send(dadosAssinatura());

    expect(resposta.status).toBe(404);
    expect(resposta.body).toEqual(ERRO_NAO_ENCONTRADA);
  });

  it.each(['abc', '0', '-1', '1.5'])(
    'responde 404 quando o id não é um inteiro positivo (%s)',
    async (id) => {
      await criar();

      const resposta = await api.put(`/subscriptions/${id}`).send(dadosAssinatura());

      expect(resposta.status).toBe(404);
      expect(resposta.body).toEqual(ERRO_NAO_ENCONTRADA);
    },
  );
});

describe('DELETE /subscriptions/:id', () => {
  it('marca como cancelada, preenche cancelado_em e some da listagem de ativas', async () => {
    const assinatura = await criar({ nome: 'Netflix' });

    const resposta = await api.delete(`/subscriptions/${assinatura.id}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ id: assinatura.id, nome: 'Netflix', status: 'cancelado' });
    expect(resposta.body.cancelado_em).toEqual(expect.any(String));
    expect(await nomesListados()).toEqual([]);
  });

  it('não afeta as outras assinaturas', async () => {
    const removida = await criar({ nome: 'Netflix' });
    await criar({ nome: 'Spotify' });

    await api.delete(`/subscriptions/${removida.id}`);

    expect(await nomesListados()).toEqual(['Spotify']);
  });

  it('responde 404 ao cancelar uma assinatura já cancelada', async () => {
    const assinatura = await criar();
    await api.delete(`/subscriptions/${assinatura.id}`);

    const resposta = await api.delete(`/subscriptions/${assinatura.id}`);

    expect(resposta.status).toBe(404);
    expect(resposta.body).toEqual(ERRO_NAO_ENCONTRADA);
  });

  it.each(['999', 'abc', '0'])('responde 404 quando o id não existe ou é inválido (%s)', async (id) => {
    const resposta = await api.delete(`/subscriptions/${id}`);

    expect(resposta.status).toBe(404);
    expect(resposta.body).toEqual(ERRO_NAO_ENCONTRADA);
  });
});

describe('PATCH /subscriptions/:id/cancel', () => {
  it('tem o mesmo efeito do DELETE', async () => {
    const assinatura = await criar({ nome: 'Netflix' });

    const resposta = await api.patch(`/subscriptions/${assinatura.id}/cancel`);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ id: assinatura.id, status: 'cancelado' });
    expect(resposta.body.cancelado_em).toEqual(expect.any(String));
    expect(await nomesListados()).toEqual([]);
    expect(await nomesListados('?status=cancelado')).toEqual(['Netflix']);
  });

  it('responde 404 quando a assinatura não existe', async () => {
    const resposta = await api.patch('/subscriptions/999/cancel');

    expect(resposta.status).toBe(404);
    expect(resposta.body).toEqual(ERRO_NAO_ENCONTRADA);
  });
});
