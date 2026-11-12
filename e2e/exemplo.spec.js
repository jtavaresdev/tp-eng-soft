// EXEMPLO COMPLETO de teste E2E. Use como referência de formato.
// Fluxo: API real + frontend real + navegador (Chromium).
import { abrirPainel, criarAssinaturaViaApi, expect, itemDaLista, test, valorDoResumo } from './helpers.js';

test('painel vazio mostra o aviso e o resumo zerado', async ({ page }) => {
  await abrirPainel(page);

  await expect(page.getByText('Nenhuma assinatura cadastrada ainda.')).toBeVisible();
  await expect(valorDoResumo(page, 'Assinaturas ativas')).toHaveText('0');
});

test('painel lista uma assinatura que já existe no banco', async ({ page, api }) => {
  await criarAssinaturaViaApi(api, { nome: 'Netflix', valor: 39.9, categoria: 'streaming' });

  await abrirPainel(page);

  const item = itemDaLista(page, 'Netflix');
  await expect(item).toBeVisible();
  await expect(item).toContainText('streaming');
  await expect(item).toContainText('39,90');
});
