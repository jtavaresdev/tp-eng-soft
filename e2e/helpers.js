// Apoio comum dos testes E2E. Importe `test` e `expect` DAQUI (e não de
// '@playwright/test') para ganhar o banco limpo antes de cada teste.
import { test as base, expect } from '@playwright/test';
import { URL_API } from './ambiente.js';

export { expect };

export const test = base.extend({
  // Cliente HTTP apontado para a API, para preparar dados sem passar pela tela.
  api: async ({ playwright }, use) => {
    const api = await playwright.request.newContext({ baseURL: URL_API });
    await use(api);
    await api.dispose();
  },

  // Roda sozinho antes de cada teste: cancela todas as assinaturas ativas,
  // então todo teste começa com o painel vazio.
  painelVazio: [
    async ({ api }, use) => {
      const ativas = await (await api.get('/subscriptions')).json();
      for (const assinatura of ativas) {
        await api.delete(`/subscriptions/${assinatura.id}`);
      }
      await use();
    },
    { auto: true },
  ],
});

// Dados válidos de uma assinatura. Sobrescreva só o que importa:
// `dadosAssinatura({ nome: 'Spotify', valor: 21.9 })`.
export function dadosAssinatura(sobrescritas = {}) {
  return {
    nome: 'Netflix',
    valor: 39.9,
    data_cobranca: '2026-10-05',
    data_inicio: '2026-01-05',
    categoria: 'streaming',
    ...sobrescritas,
  };
}

// Cria uma assinatura direto na API (pré-condição do teste, sem usar a tela).
export async function criarAssinaturaViaApi(api, sobrescritas = {}) {
  const resposta = await api.post('/subscriptions', { data: dadosAssinatura(sobrescritas) });
  expect(resposta.status()).toBe(201);
  return resposta.json();
}

export async function abrirPainel(page) {
  await page.goto('/painel');
  await expect(page.getByRole('heading', { name: 'Assinaturas ativas' })).toBeVisible();
}

// Preenche o formulário de assinatura (cadastro ou edição). Não envia.
export async function preencherFormulario(page, dados) {
  if (dados.nome !== undefined) await page.getByLabel('Nome').fill(dados.nome);
  if (dados.valor !== undefined) await page.getByLabel('Valor (R$)').fill(String(dados.valor));
  if (dados.data_cobranca !== undefined) {
    await page.getByLabel('Data de cobrança').fill(dados.data_cobranca);
  }
  if (dados.data_inicio !== undefined) {
    await page.getByLabel('Data de início').fill(dados.data_inicio);
  }
  if (dados.categoria !== undefined) {
    await page.getByLabel('Categoria').selectOption(dados.categoria);
  }
}

// Linha da lista "Assinaturas ativas" que contém o nome informado.
export function itemDaLista(page, nome) {
  return page.getByRole('listitem').filter({ hasText: nome });
}

// Valor exibido em um cartão do resumo: 'Total mensal' ou 'Assinaturas ativas'.
export function valorDoResumo(page, rotulo) {
  return page.locator('.sf-stat').filter({ hasText: rotulo }).locator('.sf-stat__value');
}
