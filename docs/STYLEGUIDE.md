# Guia de Estilo — SubFlow (Frontend)

Este documento define a identidade visual do SubFlow e como aplicá-la no código. O objetivo é que qualquer pessoa do time construa uma tela nova sem "inventar" cor, espaçamento ou fonte — tudo já está definido em `frontend/src/styles/tokens.css`.

## 1. Conceito

O SubFlow existe para responder uma pergunta simples: **"com o que eu estou gastando, e quando vou ser cobrado de novo?"**. A identidade reflete isso:

- **Azul elétrico** como cor de marca — usado em telas de marketing/onboarding (hero, landing), não no dia a dia do painel.
- **Fundo claro no painel** — quem usa o produto todo dia olha para números e listas; fundo 100% azul cansaria a vista e prejudicaria a leitura. O azul vira **destaque**, não papel de parede.
- **Tipografia condensada e pesada** nos números e títulos — o produto lida com valores em R$ e datas; números grandes e legíveis são o elemento mais importante da tela.
- **Sem cantos arredondados suaves nem sombra cinza padrão de SaaS.** Bordas retas ou levemente arredondadas (2–4px), linhas finas em vez de sombra.

## 2. Cor

Definidas em `frontend/src/styles/tokens.css`. Não usar hex direto no código — sempre `var(--sf-*)`.

| Token | Valor | Uso |
|---|---|---|
| `--sf-blue` | `#1B1BF0` | Marca. Fundo de telas de marketing (hero), botões primários no painel, links ativos. |
| `--sf-blue-deep` | `#0D0D9E` | Hover/pressed do azul. |
| `--sf-blue-soft` | `#E7E7FF` | Fundo de badges "ativo", hover sutil sobre fundo claro. |
| `--sf-ink` | `#0A0A1F` | Texto principal sobre fundo claro. |
| `--sf-paper` | `#FFFFFF` | Fundo do painel/app. |
| `--sf-mist` | `#F3F3FB` | Fundo secundário (cards, linhas zebradas de tabela). |
| `--sf-alert` | `#FF5A36` | Avisos de renovação próxima, erros, focus ring. **Não usar para outra coisa** — precisa continuar chamando atenção. |

Texto secundário: `--sf-muted` (sobre fundo claro) e `--sf-muted-on-blue` (sobre fundo azul). Bordas: `--sf-line` e `--sf-line-on-blue`.

## 3. Tipografia

Duas famílias, papéis bem separados — nunca misturar o uso delas:

- **`--sf-font-display`** (Big Shoulders Display, condensada, peso 700/800): títulos de hero, números grandes de destaque (ex.: total mensal), o logotipo "SubFlow".
- **`--sf-font-body`** (IBM Plex Sans, peso 400/500/600): navegação, parágrafos, formulários, tabelas, botões — qualquer texto que a pessoa vai ler com atenção ou preencher.

Escala definida em tokens: `--sf-size-hero`, `--sf-size-h1/h2/h3`, `--sf-size-body`, `--sf-size-small`, `--sf-size-label`. Evitar tamanhos "soltos" fora dessa escala.

Carregamento das fontes (Google Fonts) já está no `frontend/index.html`. Se criar outra página HTML, repita a tag `<link>` de lá.

## 4. Espaçamento

Escala em base 4px: `--sf-space-1` (4px) até `--sf-space-16` (64px). Usar sempre essas variáveis em `padding`, `gap` e `margin` — não usar `rem`/`px` soltos, para o espaçamento ficar consistente entre telas feitas por pessoas diferentes.

## 5. Componentes disponíveis

Ficam em `frontend/src/components/`. Antes de criar um componente novo, veja se já existe:

- **`Button`** (`variant="solid" | "outline"`) — Não fixa a cor sozinho: herda `--btn-*` do elemento pai. Para usar sobre fundo azul, envolva com uma `div` (ou o próprio contêiner) com a classe `on-blue`; sem essa classe, ele assume que está sobre fundo claro.
  ```jsx
  <Button variant="solid">Salvar</Button>                 {/* sobre fundo claro */}
  <div className="on-blue"><Button variant="solid">Ir</Button></div> {/* sobre azul */}
  ```
- **`Badge`** (`tone="ativo" | "cancelado" | "alerta"`) — selo de status de uma assinatura. `alerta` é reservado para renovação próxima (US4/US8), não usar para outros avisos.
- **`StatCard`** (`label`, `value`, `hint?`) — card de número em destaque, pensado para o total mensal (US3) e outros KPIs do painel.
- **`HeroGraphic`** — ilustração do hero (diagrama radial). Só usada na página inicial/marketing.

## 6. Regras rápidas (checklist ao revisar PR)

- [ ] Nenhuma cor em hex direto no JSX/CSS — só `var(--sf-*)`.
- [ ] Nenhum `border-radius` maior que `--sf-radius-md` (4px). Não usar o "cantinho arredondado" genérico de card SaaS.
- [ ] Números importantes (totais, valores) usam `--sf-font-display`; texto de leitura usa `--sf-font-body`.
- [ ] Telas do painel usam fundo `--sf-paper`/`--sf-mist`, não `--sf-blue` — azul é para destaque (botão, link, badge), não para o fundo inteiro.
- [ ] `--sf-alert` só aparece em avisos/erros reais.
- [ ] Testado em largura de mobile (~360px) — o hero já quebra para 1 coluna abaixo de 880px, siga o mesmo padrão em telas novas.

## 7. Onde ver a referência viva

- `frontend/src/pages/Home.jsx` + `Home.css` — implementação de referência do hero, nav e uso de `on-blue`.
- Pré-visualização estática (sem precisar rodar `npm run dev`): `docs/preview-home.html`, abra direto no navegador.
