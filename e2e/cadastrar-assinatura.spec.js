// E2E — Cadastrar assinatura (US1, US2, US8)
//
// Para implementar: troque `test.fixme` por `test` e escreva os passos.
// Rode só este arquivo com: npx playwright test e2e/cadastrar-assinatura.spec.js
import { abrirPainel, dadosAssinatura, expect, itemDaLista, preencherFormulario, test } from './helpers.js';

test.fixme('usuário cadastra uma assinatura e ela aparece na lista', async ({ page }) => {
  // 1. Abrir o painel (abrirPainel) — ele começa vazio.
  // 2. Preencher o formulário "Nova assinatura" (preencherFormulario + dadosAssinatura).
  // 3. Clicar em "Cadastrar assinatura".
  // 4. Verificar que o item aparece em "Assinaturas ativas" com nome, categoria
  //    e valor em reais (itemDaLista).
  // 5. Verificar que o aviso "Nenhuma assinatura cadastrada ainda." sumiu
  //    e que o formulário voltou a ficar em branco.
  // 6. Recarregar a página (page.reload) e verificar que o item continua lá
  //    (ou seja, foi salvo no backend de verdade).
});
