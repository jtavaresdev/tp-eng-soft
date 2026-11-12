// E2E — Remover assinatura (US6)
//
// Para implementar: troque `test.fixme` por `test` e escreva os passos.
// Rode só este arquivo com: npx playwright test e2e/remover-assinatura.spec.js
import { abrirPainel, criarAssinaturaViaApi, expect, itemDaLista, test } from './helpers.js';

test.fixme('usuário remove uma assinatura confirmando no segundo clique', async ({ page, api }) => {
  // 1. Criar duas assinaturas pela API (criarAssinaturaViaApi) e abrir o painel.
  // 2. Clicar em "Remover" em uma delas (itemDaLista) e verificar que o botão
  //    virou "Confirmar?" — a assinatura ainda está na lista.
  // 3. Clicar em "Confirmar?".
  // 4. Verificar que o item removido sumiu e que o outro continua na lista.
  // 5. Recarregar a página (page.reload) e verificar que o item não voltou.
  // Extra (opcional): sem o segundo clique, o botão volta a ser "Remover"
  //    depois de 3 segundos e nada é removido.
});
