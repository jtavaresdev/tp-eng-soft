# Sprint 0 — Planejamento e Decisões Técnicas

**Projeto:** Gerenciador de Assinaturas
**Data:** [16/09/2026]

## Time de Desenvolvimento
* Italo Rodrigues de Matos Avelar — Full-Stack
* João Victor Tavares Neto — Full-Stack
* Nathan Filipe Izidorio Alves — Full-Stack
* Pedro Gabriel Barruetavena Vieira — Full-Stack

---

## 1. Decisões Técnicas

### 1.1 Modelagem do Banco de Dados

**Tabela `subscriptions`**

| Campo | Tipo | Observação |
|---|---|---|
| id | INTEGER / UUID | Chave primária |
| nome | VARCHAR | Nome do serviço (ex: Netflix) |
| valor | DECIMAL | Valor cobrado |
| data_cobranca | DATE | Dia da cobrança/renovação |
| categoria | VARCHAR / FK | Ver decisão abaixo |
| status | VARCHAR | ativo / cancelado |
| criado_em | TIMESTAMP | Data de cadastro |

**Categorias:** [DECISÃO: enum fixo no código (streaming, produtividade, jogos, academia, outros) OU tabela `categories` separada]
> Preencher: __________________________________________

### 1.2 Autenticação

[DECISÃO: sistema single-user, sem login, para focar no escopo das 8 histórias / OU autenticação básica com JWT]
> Preencher: __________________________________________
> Justificativa: __________________________________________

### 1.3 Notificações

- Canal obrigatório: [e-mail via Nodemailer / Telegram Bot API]
- Canal stretch goal (se sobrar tempo): __________________________________________
- Regra de disparo: notificar X dias antes da data de cobrança → **X = ___**
- Frequência do job (node-cron): __________________________________________

### 1.4 Frontend

- Biblioteca de gráficos: [Chart.js / Recharts]
- Estrutura de pastas (sugestão): `src/components`, `src/pages`, `src/services`, `src/hooks`
- Estilização: __________________________________________

### 1.5 Ambiente

- Banco em desenvolvimento: SQLite
- Banco em produção/entrega: PostgreSQL (se aplicável)
- Variáveis de ambiente (.env): __________________________________________

---

## 2. Definition of Ready (DoR)

Uma issue pode entrar na coluna **Ready** quando:
- [ ] Possui título claro e descrição do que deve ser feito
- [ ] Critério de aceite está descrito
- [ ] Não possui dependência bloqueada por outra issue
- [ ] Estimativa em story points definida
- [ ] Está vinculada à história de usuário correspondente

## 3. Definition of Done (DoD)

Uma issue é considerada **Done** quando:
- [ ] Código implementado e funcional
- [ ] Pull Request aberto, vinculado à issue
- [ ] PR revisado e aprovado por pelo menos outro dev do time
- [ ] Mergeado na branch principal
- [ ] Critério de aceite validado manualmente (teste exploratório)
- [ ] Sem erros no console / build quebrado

---

## 4. Backlog Priorizado — Sprint 1

| Prioridade | História | Story Points | Responsável |
|---|---|---|---|
| 1 | US1 — Cadastrar assinatura | 5 | Dev A |
| 2 | US5 — Editar assinatura | 3 | Dev A |
| 3 | US2 — Listar assinaturas ativas | 3 | Dev B |
| 4 | US6 — Remover assinatura | 2 | Dev B |
| 5 | US3 — Total mensal | 3 | Dev C |
| 6 | US7 — Gráfico de evolução | 5 | Dev C |
| 7 | US4 — Notificação de renovação | 8 | Dev D |
| 8 | US8 — Categorização | 3 | Dev D |

**Total de Story Points:** 32

> Dev A / B / C / D = substituir pelos nomes reais do time.

---

## 5. Meta da Sprint 1 (Sprint Goal)

> Ao final da sprint, o usuário deve conseguir cadastrar, listar, editar e remover assinaturas, visualizar o valor total gasto por mês, acompanhar a evolução dos gastos em gráfico, categorizar suas assinaturas e receber notificações antes da renovação.

---

## 6. Cerimônias Planejadas

| Cerimônia | Formato | Frequência |
|---|---|---|
| Sprint Planning | Reunião + este documento | Início da sprint |
| Daily Scrum | Registro assíncrono (fez / vai fazer / bloqueio) em `daily-log.md` ou grupo do time | Diária |
| Sprint Review | Demo das histórias concluídas (Done) | Final da sprint |
| Retrospectiva | Discussão: o que funcionou / o que não funcionou / o que mudar | Final da sprint |

---

## 7. Riscos e Pontos de Atenção

- US4 (notificações) é a de maior complexidade (8 pontos) — priorizar início cedo para não virar gargalo no fim da sprint.
- Dependência entre US1 e US5 (edição reaproveita formulário de cadastro) — alinhar contrato do formulário antes de paralelizar.
- Definir cedo o formato de resposta da API (JSON) para não gerar retrabalho de integração front-back.
