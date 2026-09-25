# Contrato da API — Gerenciador de Assinaturas

**Versão:** 0.1 (Sprint 1)
**Base URL (desenvolvimento):** `http://localhost:3001`
**Formato:** JSON (`Content-Type: application/json`) em todas as requisições e respostas.

> Este documento é a referência única do contrato entre frontend e backend. Qualquer mudança de rota, campo ou formato deve ser atualizada aqui **antes** de ser implementada, para evitar retrabalho de integração (risco apontado no Sprint 0).

---

## 1. Convenções gerais

- Datas em `YYYY-MM-DD` (ex.: `2026-10-05`), horários em `HH:mm:ss` quando existirem.
- Valores monetários como `number` (ex.: `39.90`), nunca string.
- IDs são `integer` autoincremento.
- Toda resposta de erro segue o mesmo formato (seção 2).
- Não há autenticação nesta versão (sistema single-user, decisão do Sprint 0).

## 2. Formato padrão de erro

```json
{
  "error": "Mensagem descrevendo o problema"
}
```

| Status | Quando usar |
|---|---|
| 400 | Dados inválidos ou campo obrigatório faltando |
| 404 | Recurso (id) não encontrado |
| 500 | Erro inesperado no servidor |

---

## 3. Recurso: Subscriptions

### Modelo `Subscription`

```json
{
  "id": 1,
  "nome": "Netflix",
  "valor": 39.90,
  "data_cobranca": "2026-10-05",
  "categoria": "streaming",
  "status": "ativo",
  "criado_em": "2026-09-01T12:00:00.000Z",
  "cancelado_em": null
}
```

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| id | integer | gerado pelo servidor | — |
| nome | string | sim | não vazio |
| valor | number | sim | maior que 0 |
| data_cobranca | string (date) | sim | dia do mês da cobrança/renovação |
| categoria | string (enum) | sim | ver seção 5 |
| status | string (enum) | gerado pelo servidor | `ativo` \| `cancelado` |
| criado_em | string (datetime) | gerado pelo servidor | — |
| cancelado_em | string (datetime) \| null | gerado pelo servidor | preenchido no DELETE |

---

### `GET /subscriptions`

Lista assinaturas, ordenadas por `data_cobranca` (crescente).

**Query params**

| Param | Valores | Padrão | Observação |
|---|---|---|---|
| status | `ativo` \| `cancelado` \| `todos` | `ativo` | filtra por status |

**Exemplo:** `GET /subscriptions?status=ativo`

**Resposta 200**
```json
[
  {
    "id": 1,
    "nome": "Netflix",
    "valor": 39.90,
    "data_cobranca": "2026-10-05",
    "categoria": "streaming",
    "status": "ativo",
    "criado_em": "2026-09-01T12:00:00.000Z",
    "cancelado_em": null
  }
]
```
Lista vazia (`[]`) quando não há resultados — **nunca** retorna erro nesse caso.

---

### `POST /subscriptions`

Cria uma nova assinatura.

**Request body**
```json
{
  "nome": "Netflix",
  "valor": 39.90,
  "data_cobranca": "2026-10-05",
  "categoria": "streaming"
}
```

**Resposta 201** — retorna o objeto criado (modelo `Subscription` completo, com `id`, `status: "ativo"` e `criado_em`).

**Resposta 400** — exemplos:
```json
{ "error": "O campo 'nome' é obrigatório" }
```
```json
{ "error": "O campo 'valor' deve ser maior que zero" }
```
```json
{ "error": "Categoria inválida. Use: streaming, produtividade, jogos, academia, outros" }
```

---

### `PUT /subscriptions/:id`

Atualiza uma assinatura existente. Mesmas validações do `POST`.

**Request body** — mesmo formato do `POST` (todos os campos editáveis).

**Resposta 200** — objeto atualizado.
**Resposta 404** — `{ "error": "Assinatura não encontrada" }`
**Resposta 400** — mesmas mensagens do `POST`.

---

### `DELETE /subscriptions/:id`

Remoção lógica: muda `status` para `cancelado` e preenche `cancelado_em` com o timestamp atual. Não apaga o registro (necessário para o histórico do gráfico, US7).

**Resposta 200**
```json
{
  "id": 1,
  "status": "cancelado",
  "cancelado_em": "2026-09-25T10:00:00.000Z"
}
```
**Resposta 404** — `{ "error": "Assinatura não encontrada" }`

---

## 4. Recurso: Summary

### `GET /subscriptions/summary`

Retorna o total gasto por mês e a quantidade de assinaturas ativas (US3).

**Resposta 200**
```json
{
  "total_mensal": 129.70,
  "quantidade_ativas": 4
}
```
Quando não há assinaturas ativas: `{ "total_mensal": 0, "quantidade_ativas": 0 }` (nunca erro).

---

## 5. Categorias

Enum fixo, validado no `POST` e `PUT` de subscriptions:

```
streaming | produtividade | jogos | academia | outros
```

### `GET /categories` *(opcional, facilita o `<select>` do frontend)*

**Resposta 200**
```json
["streaming", "produtividade", "jogos", "academia", "outros"]
```

---

## 6. Estatísticas

### `GET /stats/monthly-evolution`

Gasto total por mês, considerando os últimos 12 meses. Uma assinatura conta em um mês se estava ativa em algum momento dele (entre `criado_em` e `cancelado_em`, ou ainda ativa). Suporta US7.

**Resposta 200**
```json
[
  { "mes": "2025-10", "total": 89.80 },
  { "mes": "2025-11", "total": 89.80 },
  { "mes": "2025-12", "total": 129.70 }
]
```
- `mes` no formato `YYYY-MM`, ordem cronológica crescente.
- Meses sem nenhuma assinatura ativa retornam `"total": 0` (não pulam o mês).

---

### `GET /stats/by-category`

Total gasto por categoria, considerando apenas assinaturas ativas. Suporta US8.

**Resposta 200**
```json
[
  { "categoria": "streaming", "total": 79.80 },
  { "categoria": "produtividade", "total": 49.90 },
  { "categoria": "jogos", "total": 0 },
  { "categoria": "academia", "total": 0 },
  { "categoria": "outros", "total": 0 }
]
```
- Retorna todas as categorias do enum, mesmo com `total: 0` (o frontend decide se omite as zeradas no gráfico).
- A soma de todos os `total` deve bater com `total_mensal` do `/subscriptions/summary`.

---

## 7. Resumo de rotas

| Método | Rota | História | Descrição |
|---|---|---|---|
| GET | `/health` | S1 | Verifica se a API está no ar |
| GET | `/subscriptions` | US2 | Lista assinaturas |
| POST | `/subscriptions` | US1 | Cria assinatura |
| PUT | `/subscriptions/:id` | US5 | Edita assinatura |
| DELETE | `/subscriptions/:id` | US6 | Cancela assinatura (lógico) |
| GET | `/subscriptions/summary` | US3 | Total mensal e quantidade ativas |
| GET | `/categories` | US8 | Lista categorias válidas |
| GET | `/stats/monthly-evolution` | US7 | Série mensal de gastos |
| GET | `/stats/by-category` | US8 | Total por categoria |

---

## 8. Pendente para as próximas sprints

- Rotas de notificação (US4) não fazem parte deste contrato porque o job de e-mail (`node-cron`) não expõe endpoints REST na Sprint 1. Se for necessário um endpoint de disparo manual para teste (ex.: `POST /notifications/test-run`), adicionar aqui antes de implementar (ver issue US4-3).
- Autenticação: fora de escopo (sistema single-user).
