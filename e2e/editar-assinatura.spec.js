// E2E — Editar assinatura (US5)
//
// Rode só este arquivo com: npx playwright test e2e/editar-assinatura.spec.js
import { abrirPainel, criarAssinaturaViaApi, expect, itemDaLista, preencherFormulario, test } from './helpers.js';

test('usuário edita o valor e o nome de uma assinatura', async ({ page, api }) => {
  await criarAssinaturaViaApi(api, { nome: 'Netflix', valor: 39.9 });
  await abrirPainel(page);

  const itemOriginal = itemDaLista(page, 'Netflix');
  await expect(itemOriginal).toBeVisible();
  await itemOriginal.getByRole('button', { name: 'Editar' }).click();

  await expect(page.getByRole('heading', { name: 'Editar assinatura' })).toBeVisible();
  await expect(page.getByLabel('Nome')).toHaveValue('Netflix');
  await expect(page.getByLabel('Valor (R$)')).toHaveValue('39.9');

  await preencherFormulario(page, { nome: 'Prime Video Premium', valor: 55.9 });
  await page.getByRole('button', { name: 'Salvar alterações' }).click();

  const itemAtualizado = itemDaLista(page, 'Prime Video Premium');
  await expect(itemAtualizado).toBeVisible();
  await expect(itemAtualizado).toContainText('55,90');
  await expect(itemDaLista(page, 'Netflix')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Nova assinatura' })).toBeVisible();
});
