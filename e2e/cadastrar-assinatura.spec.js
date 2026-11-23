// E2E — Cadastrar assinatura (US1, US2, US8), conforme docs/testes.md.
import { abrirPainel, dadosAssinatura, expect, itemDaLista, preencherFormulario, test } from './helpers.js';

test('usuário cadastra uma assinatura e ela aparece na lista', async ({ page }) => {
  const dados = dadosAssinatura();
  await abrirPainel(page);
  const avisoVazio = page.getByText('Nenhuma assinatura cadastrada ainda.', { exact: true });
  await expect(avisoVazio).toBeVisible();

  await preencherFormulario(page, dados);
  await page.getByRole('button', { name: 'Cadastrar assinatura', exact: true }).click();

  const item = itemDaLista(page, dados.nome);
  await expect(item).toHaveCount(1);
  await expect(item).toBeVisible();
  await expect(item).toContainText(dados.categoria);
  await expect(item).toContainText(/R\$\s*39,90/);
  await expect(avisoVazio).toHaveCount(0);
  for (const campo of ['Nome', 'Valor (R$)', 'Data de cobrança', 'Data de início', 'Categoria']) {
    await expect(page.getByLabel(campo, { exact: true })).toHaveValue('');
  }

  await page.reload();
  await expect(item).toHaveCount(1);
  await expect(item).toBeVisible();
  await expect(item).toContainText(dados.categoria);
  await expect(item).toContainText(/R\$\s*39,90/);
  await expect(avisoVazio).toHaveCount(0);
});
