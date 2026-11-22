// E2E — Resumo mensal (US3)
//
// Rode só este arquivo com: npx playwright test e2e/resumo-mensal.spec.js
import {
  abrirPainel,
  criarAssinaturaViaApi,
  dadosAssinatura,
  expect,
  itemDaLista,
  preencherFormulario,
  test,
  valorDoResumo,
} from './helpers.js';

test('total mensal e quantidade acompanham as assinaturas cadastradas', async ({ page, api }) => {
  // 1. Pré-condição: uma assinatura de R$ 39,90 criada pela API (sem passar pela tela).
  await criarAssinaturaViaApi(api, { nome: 'Netflix', valor: 39.9 });
  await abrirPainel(page);

  // Marca a página: se ela recarregar, a marca some e o teste falha no passo 4.
  await page.evaluate(() => {
    window.__semRecarregar = true;
  });

  // 2. O resumo reflete a assinatura existente.
  // (O valor vem como "R$ 39,90" com espaço especial; por isso toContainText.)
  await expect(valorDoResumo(page, 'Total mensal')).toContainText('39,90');
  await expect(valorDoResumo(page, 'Assinaturas ativas')).toHaveText('1');

  // 3. Cadastra, pela tela, uma segunda assinatura de R$ 21,90.
  await preencherFormulario(
    page,
    dadosAssinatura({ nome: 'Spotify', valor: 21.9, data_cobranca: '2026-10-10' }),
  );
  await page.getByRole('button', { name: 'Cadastrar assinatura' }).click();
  await expect(itemDaLista(page, 'Spotify')).toBeVisible();

  // 4. O resumo atualizou sozinho: 39,90 + 21,90 = 61,80 e 2 assinaturas.
  await expect(valorDoResumo(page, 'Total mensal')).toContainText('61,80');
  await expect(valorDoResumo(page, 'Assinaturas ativas')).toHaveText('2');

  // ...e isso aconteceu sem recarregar a página.
  expect(await page.evaluate(() => window.__semRecarregar)).toBe(true);
});