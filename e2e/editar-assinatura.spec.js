// E2E — Editar assinatura (US5)
//
// Para implementar: troque `test.fixme` por `test` e escreva os passos.
// Rode só este arquivo com: npx playwright test e2e/editar-assinatura.spec.js
import { abrirPainel, criarAssinaturaViaApi, expect, itemDaLista, preencherFormulario, test } from './helpers.js';

test.fixme('usuário edita o valor e o nome de uma assinatura', async ({ page, api }) => {
  // 1. Criar uma assinatura pela API (criarAssinaturaViaApi) e abrir o painel.
  // 2. Clicar em "Editar" no item da lista (itemDaLista).
  // 3. Verificar que o título do formulário virou "Editar assinatura" e que os
  //    campos vieram preenchidos com os dados atuais.
  // 4. Alterar nome e valor (preencherFormulario) e clicar em "Salvar alterações".
  // 5. Verificar que a lista mostra o novo nome e o novo valor, e que o nome
  //    antigo não aparece mais.
  // 6. Verificar que o formulário voltou para "Nova assinatura".
  // Extra (opcional): clicar em "Editar" e depois "Cancelar" não altera nada.
});
