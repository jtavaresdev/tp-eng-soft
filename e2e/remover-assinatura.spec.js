// E2E — Remover assinatura (US6)
//
// Rode só este arquivo com: npx playwright test e2e/remover-assinatura.spec.js
import {
  abrirPainel,
  criarAssinaturaViaApi,
  expect,
  itemDaLista,
  test,
  valorDoResumo,
} from './helpers.js';

test('usuário remove uma assinatura confirmando no segundo clique', async ({ page, api }) => {
  await criarAssinaturaViaApi(api, { nome: 'Netflix', valor: 39.9 });
  await criarAssinaturaViaApi(api, { nome: 'Spotify', valor: 21.9 });
  await abrirPainel(page);

  const netflix = itemDaLista(page, 'Netflix');
  const spotify = itemDaLista(page, 'Spotify');
  await expect(netflix).toBeVisible();
  await expect(spotify).toBeVisible();

  // Primeiro clique só pede confirmação; nada é removido ainda.
  await netflix.getByRole('button', { name: 'Remover' }).click();
  await expect(netflix.getByRole('button', { name: 'Confirmar?' })).toBeVisible();
  await expect(netflix).toBeVisible();

  // Segundo clique remove de verdade.
  await netflix.getByRole('button', { name: 'Confirmar?' }).click();

  await expect(netflix).toHaveCount(0);
  await expect(spotify).toBeVisible();
  await expect(valorDoResumo(page, 'Assinaturas ativas')).toHaveText('1');
  await expect(valorDoResumo(page, 'Total mensal')).toContainText('21,90');

  // Continua removida depois de recarregar: foi cancelada no backend.
  await page.reload();
  await expect(spotify).toBeVisible();
  await expect(netflix).toHaveCount(0);
});

test('sem confirmar, o botão volta a "Remover" e a assinatura permanece', async ({ page, api }) => {
  await criarAssinaturaViaApi(api, { nome: 'Netflix' });
  await abrirPainel(page);

  const netflix = itemDaLista(page, 'Netflix');
  await netflix.getByRole('button', { name: 'Remover' }).click();
  await expect(netflix.getByRole('button', { name: 'Confirmar?' })).toBeVisible();

  // A confirmação expira sozinha depois de 3 segundos.
  await expect(netflix.getByRole('button', { name: 'Remover' })).toBeVisible({ timeout: 6000 });

  await page.reload();
  await expect(netflix).toBeVisible();
});
