// E2E — Resumo mensal (US3)
//
// Para implementar: troque `test.fixme` por `test` e escreva os passos.
// Rode só este arquivo com: npx playwright test e2e/resumo-mensal.spec.js
import {
  abrirPainel,
  criarAssinaturaViaApi,
  dadosAssinatura,
  expect,
  preencherFormulario,
  test,
  valorDoResumo,
} from './helpers.js';

test.fixme('total mensal e quantidade acompanham as assinaturas cadastradas', async ({ page, api }) => {
  // 1. Criar uma assinatura de R$ 39,90 pela API (criarAssinaturaViaApi) e abrir o painel.
  // 2. Verificar o resumo (valorDoResumo): "Total mensal" = R$ 39,90 e
  //    "Assinaturas ativas" = 1.
  // 3. Cadastrar pela tela uma segunda assinatura de R$ 21,90
  //    (preencherFormulario + botão "Cadastrar assinatura").
  // 4. Verificar que o resumo atualizou sozinho, sem recarregar a página:
  //    "Total mensal" = R$ 61,80 e "Assinaturas ativas" = 2.
  // Dica: o valor vem formatado como "R$ 61,80" com um espaço especial depois
  //    de "R$"; compare com toContainText('61,80').
});
