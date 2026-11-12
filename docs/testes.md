# Testes — guia e divisão do trabalho

Requisitos do trabalho que este guia atende:

- **Testes de unidade e/ou de integração com cobertura mínima de 80%**
- **4 testes end-to-end (E2E)** — um por desenvolvedor

## Ferramentas

| Tipo | Ferramenta | Onde ficam |
|---|---|---|
| Unidade | Vitest | `backend/tests/unit/` |
| Integração (HTTP + SQLite) | Vitest + Supertest | `backend/tests/integration/` |
| Cobertura | `@vitest/coverage-v8` (limite de 80%) | relatório em `backend/coverage/` |
| End-to-end | Playwright (Chromium) | `e2e/` |

A cobertura de 80% é medida sobre o **backend** (`backend/src/`, exceto `server.js`), em linhas, instruções e funções. O frontend é exercitado pelos testes E2E.

## Como rodar

Na raiz do repositório:

```bash
npm run install:all        # instala as dependências (uma vez)
npm run test:e2e:install   # baixa o Chromium do Playwright (uma vez)

npm test                   # unidade + integração
npm run test:coverage      # idem, com relatório e verificação dos 80%
npm run test:e2e           # end-to-end (sobe API e frontend sozinho)
npm run test:e2e:ui        # end-to-end com a interface do Playwright
```

Durante o desenvolvimento, dentro de `backend/`:

```bash
npm run test:watch                                # reexecuta ao salvar
npx vitest run tests/unit/dateUtils.test.js       # um arquivo só
```

Nenhum teste usa o banco de desenvolvimento nem envia e-mail:

- Unidade/integração: cada arquivo de teste recebe um SQLite vazio em `backend/data/test/` (`tests/setup.js`), com envio de e-mail em dry-run e o cron desligado.
- E2E: a API sobe na porta 3101 com `backend/data/e2e.db` (recriado a cada execução) e o frontend na 5174. Dá para rodar com o `npm run dev` aberto.

## Como escrever

Cada arquivo já tem **um teste pronto** que serve de modelo e uma lista de casos pendentes.

- Unidade/integração: troque `it.todo('descrição')` por `it('descrição', async () => { ... })`.
- E2E: troque `test.fixme(` por `test(` e implemente os passos descritos nos comentários.

Apoio disponível:

| Arquivo | O que oferece |
|---|---|
| `backend/tests/helpers/api.js` | `api` — cliente Supertest ligado ao app (`await api.get('/health')`) |
| `backend/tests/helpers/banco.js` | `limparBanco()`, `dadosAssinatura()`, `inserirAssinatura()` |
| `e2e/helpers.js` | `test`/`expect`, `api`, `criarAssinaturaViaApi()`, `abrirPainel()`, `preencherFormulario()`, `itemDaLista()`, `valorDoResumo()` |

Exemplos completos: `backend/tests/integration/health.test.js` e `e2e/exemplo.spec.js`.

Convenções:

- **Unidade** = sem banco e sem HTTP (função pura, ou dependência trocada por dublê com `vi.mock`/parâmetro).
- **Integração** = requisição HTTP no app e/ou SQLite de verdade. Comece com `beforeEach(limparBanco)`.
- Descrições em português, dizendo o comportamento esperado.
- Um teste não depende de outro nem da ordem de execução.
- Para variáveis de ambiente use `vi.stubEnv('NOME', 'valor')`; para data atual, `vi.useFakeTimers()` + `vi.setSystemTime(...)` (e `vi.useRealTimers()` no `afterEach`).

## Divisão

| Área | Responsável (sugestão) | Unidade / integração | E2E |
|---|---|---|---|
| 1. Assinaturas (CRUD) — US1, US2, US5, US6 | João | `unit/validarAssinatura.test.js`, `integration/subscriptions.test.js` | `e2e/remover-assinatura.spec.js` |
| 2. Datas, próximas cobranças e e-mail — US4 | Pedro | `unit/dateUtils.test.js`, `unit/email.test.js`, `integration/upcomingCharges.test.js` | `e2e/resumo-mensal.spec.js` |
| 3. Resumo e estatísticas — US3, US7, US8 | Italo | `unit/historicoMensal.test.js`, `integration/stats.test.js` | `e2e/cadastrar-assinatura.spec.js` |
| 4. Job de notificações — US4 | Nathan | `unit/notificationService.test.js`, `integration/notificationJob.test.js` | `e2e/editar-assinatura.spec.js` |

A sugestão de responsável segue quem mais mexeu em cada parte do código; o E2E de cada um cobre uma tela que a pessoa implementou.

### Pronto quando

- Nenhum `it.todo`, `test.fixme`, `.skip` ou `.only` restante nos arquivos da área.
- `npm test` e `npm run test:e2e` passam.
- No relatório de `npm run test:coverage`, os arquivos de `src/` da área estão com 80% ou mais.

O limite global de 80% só fica verde quando as quatro áreas terminarem; até lá, `npm run test:coverage` termina com erro de cobertura — isso é esperado.

## Issues para o GitHub Projects

Uma issue por área. Título e corpo prontos para colar.

### Issue 1

**Título:** `test: assinaturas (CRUD) + E2E de remoção`

```markdown
Área 1 do guia `docs/testes.md` — US1, US2, US5, US6.

**Código coberto:** `validarAssinatura`, `criarAssinatura`, `buscarAssinaturas`, `atualizarAssinatura`, `cancelarAssinatura` (`subscriptionsService.js`) e as rotas `POST/GET/PUT/DELETE /subscriptions` e `PATCH /subscriptions/:id/cancel` (`subscriptionsController.js`).

- [ ] `backend/tests/unit/validarAssinatura.test.js` — implementar os `it.todo`
- [ ] `backend/tests/integration/subscriptions.test.js` — implementar os `it.todo`
- [ ] `e2e/remover-assinatura.spec.js` — implementar o teste E2E
- [ ] `npm test` e `npm run test:e2e` passando
- [ ] Arquivos da área com cobertura >= 80% em `npm run test:coverage`
```

### Issue 2

**Título:** `test: datas, próximas cobranças e e-mail + E2E do resumo mensal`

```markdown
Área 2 do guia `docs/testes.md` — US4.

**Código coberto:** `util/dateUtils.js`, `buscarProximasCobrancas` (`subscriptionsService.js`), `services/mail/` (`emailService.js`, `mailer.js`, `templateLembrete.js`) e as rotas `GET /subscriptions/upcoming-charges` e `POST /subscriptions/notify-upcoming`.

- [ ] `backend/tests/unit/dateUtils.test.js` — implementar os `it.todo`
- [ ] `backend/tests/unit/email.test.js` — implementar os `it.todo`
- [ ] `backend/tests/integration/upcomingCharges.test.js` — implementar os `it.todo`
- [ ] `e2e/resumo-mensal.spec.js` — implementar o teste E2E
- [ ] `npm test` e `npm run test:e2e` passando
- [ ] Arquivos da área com cobertura >= 80% em `npm run test:coverage`
```

### Issue 3

**Título:** `test: resumo e estatísticas + E2E de cadastro`

```markdown
Área 3 do guia `docs/testes.md` — US3, US7, US8.

**Código coberto:** `calcularResumoMensal`, `calcularGastosPorCategoria`, `calcularHistoricoMensal` (`subscriptionsService.js`), `subscriptionRepository.js`, `statsController.js` e as rotas `GET /subscriptions/summary`, `GET /stats/by-category` e `GET /stats/monthly-evolution`.

- [ ] `backend/tests/unit/historicoMensal.test.js` — implementar os `it.todo`
- [ ] `backend/tests/integration/stats.test.js` — implementar os `it.todo`
- [ ] `e2e/cadastrar-assinatura.spec.js` — implementar o teste E2E
- [ ] `npm test` e `npm run test:e2e` passando
- [ ] Arquivos da área com cobertura >= 80% em `npm run test:coverage`
```

### Issue 4

**Título:** `test: job de notificações + E2E de edição`

```markdown
Área 4 do guia `docs/testes.md` — US4.

**Código coberto:** `notificationService.js` (`criarTransporter`, `enviarLembrete`, `executarJobNotificacoes`, agendamento), `notificationRepository.js`, `notificationsController.js` e a rota `POST /notifications/test-run`.

- [ ] `backend/tests/unit/notificationService.test.js` — implementar os `it.todo`
- [ ] `backend/tests/integration/notificationJob.test.js` — implementar os `it.todo`
- [ ] `e2e/editar-assinatura.spec.js` — implementar o teste E2E
- [ ] `npm test` e `npm run test:e2e` passando
- [ ] Arquivos da área com cobertura >= 80% em `npm run test:coverage`
```
