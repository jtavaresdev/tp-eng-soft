// Conteúdo da seção de documentação da Home (#docs).
// Reflete as rotas reais em backend/src/routes/. Se uma rota mudar, atualize aqui também.

export const API_BASE_URL = 'http://localhost:3001';

const ASSINATURA = `{
  "id": 1,
  "nome": "Netflix",
  "valor": 39.9,
  "data_cobranca": "2026-10-05",
  "data_inicio": "2026-01-05",
  "categoria": "streaming",
  "status": "ativo",
  "criado_em": "2026-09-26 14:20:00",
  "cancelado_em": null
}`;

const ASSINATURA_CANCELADA = `{
  "id": 1,
  "nome": "Netflix",
  "valor": 39.9,
  "data_cobranca": "2026-10-05",
  "data_inicio": "2026-01-05",
  "categoria": "streaming",
  "status": "cancelado",
  "criado_em": "2026-09-26 14:20:00",
  "cancelado_em": "2026-09-28 10:00:00"
}`;

const CORPO_ASSINATURA = `{
  "nome": "Netflix",
  "valor": 39.90,
  "data_cobranca": "2026-10-05",
  "data_inicio": "2026-01-05",
  "categoria": "streaming"
}`;

const CAMPOS_ASSINATURA = [
  { nome: 'nome', tipo: 'string', descricao: 'Obrigatório, não pode ser vazio.' },
  { nome: 'valor', tipo: 'number', descricao: 'Obrigatório, maior que zero (ex.: 39.90).' },
  { nome: 'data_cobranca', tipo: 'string', descricao: 'Data da cobrança, no formato AAAA-MM-DD.' },
  {
    nome: 'data_inicio',
    tipo: 'string',
    descricao: 'Data em que a assinatura começou (AAAA-MM-DD). Usada no gráfico de evolução.',
  },
  {
    nome: 'categoria',
    tipo: 'string',
    descricao: 'streaming, produtividade, jogos, academia ou outros.',
  },
];

const ERRO_VALIDACAO = `{ "error": "O campo 'valor' deve ser maior que zero" }`;
const ERRO_NAO_ENCONTRADA = `{ "error": "Assinatura não encontrada" }`;

export const grupos = [
  {
    id: 'assinaturas',
    titulo: 'Assinaturas',
    descricao: 'Cadastro, listagem, edição e cancelamento (US1, US2, US5 e US6).',
    endpoints: [
      {
        metodo: 'POST',
        caminho: '/subscriptions',
        resumo: 'Cria uma nova assinatura com status "ativo".',
        campos: CAMPOS_ASSINATURA,
        corpo: CORPO_ASSINATURA,
        respostas: [
          { status: 201, descricao: 'Assinatura criada.', exemplo: ASSINATURA },
          { status: 400, descricao: 'Campo faltando ou inválido.', exemplo: ERRO_VALIDACAO },
        ],
      },
      {
        metodo: 'GET',
        caminho: '/subscriptions',
        resumo:
          'Lista as assinaturas ordenadas pela data de cobrança. Quando não há resultados, devolve uma lista vazia (nunca erro).',
        params: [
          {
            nome: 'status',
            onde: 'query',
            descricao: '"ativo" (padrão) ou "cancelado".',
          },
        ],
        respostas: [
          {
            status: 200,
            descricao: 'Lista de assinaturas (campos restantes omitidos no exemplo).',
            exemplo: `[
  {
    "id": 1,
    "nome": "Netflix",
    "valor": 39.9,
    "data_cobranca": "2026-10-05",
    "categoria": "streaming",
    "status": "ativo"
  }
]`,
          },
        ],
      },
      {
        metodo: 'PUT',
        caminho: '/subscriptions/:id',
        resumo:
          'Atualiza uma assinatura existente. Usa as mesmas validações do cadastro, e o corpo precisa trazer todos os campos.',
        params: [{ nome: 'id', onde: 'path', descricao: 'ID da assinatura.' }],
        campos: CAMPOS_ASSINATURA,
        corpo: CORPO_ASSINATURA,
        respostas: [
          { status: 200, descricao: 'Assinatura atualizada.', exemplo: ASSINATURA },
          { status: 400, descricao: 'Campo faltando ou inválido.', exemplo: ERRO_VALIDACAO },
          { status: 404, descricao: 'ID não existe.', exemplo: ERRO_NAO_ENCONTRADA },
        ],
      },
      {
        metodo: 'DELETE',
        caminho: '/subscriptions/:id',
        alias: 'PATCH /subscriptions/:id/cancel',
        resumo:
          'Cancela a assinatura (remoção lógica): o status vira "cancelado" e cancelado_em é preenchido. O registro é mantido para o histórico.',
        params: [{ nome: 'id', onde: 'path', descricao: 'ID da assinatura.' }],
        respostas: [
          { status: 200, descricao: 'Assinatura cancelada.', exemplo: ASSINATURA_CANCELADA },
          {
            status: 404,
            descricao: 'ID não existe ou a assinatura já estava cancelada.',
            exemplo: ERRO_NAO_ENCONTRADA,
          },
        ],
      },
    ],
  },
  {
    id: 'resumo',
    titulo: 'Resumo e cobranças',
    descricao: 'Indicadores do painel e alertas de renovação (US3 e US4).',
    endpoints: [
      {
        metodo: 'GET',
        caminho: '/subscriptions/summary',
        resumo:
          'Soma dos valores e quantidade das assinaturas ativas. Sem assinaturas, devolve zeros.',
        respostas: [
          {
            status: 200,
            descricao: 'Resumo calculado.',
            exemplo: `{
  "totalMensal": 129.7,
  "quantidadeAtivas": 4
}`,
          },
          {
            status: 500,
            descricao: 'Falha ao calcular.',
            exemplo: `{ "error": "Não foi possível calcular o resumo das assinaturas." }`,
          },
        ],
      },
      {
        metodo: 'GET',
        caminho: '/subscriptions/upcoming-charges',
        resumo:
          'Lista as assinaturas ativas cuja próxima cobrança acontece exatamente daqui a N dias (N = NOTIFY_DAYS_BEFORE no .env, padrão 3).',
        params: [
          {
            nome: 'date',
            onde: 'query',
            descricao: 'Data de referência AAAA-MM-DD. Opcional; o padrão é hoje (UTC).',
          },
        ],
        respostas: [
          {
            status: 200,
            descricao: 'Cobranças próximas.',
            exemplo: `[
  {
    "id": 1,
    "nome": "Netflix",
    "valor": 39.9,
    "proximaCobranca": "2026-10-05",
    "diasRestantes": 3
  }
]`,
          },
          {
            status: 400,
            descricao: 'Parâmetro date inválido.',
            exemplo: `{ "error": "Parâmetro \\"date\\" inválido. Use o formato YYYY-MM-DD (ex: 2026-02-25)." }`,
          },
          {
            status: 500,
            descricao: 'Falha ao calcular.',
            exemplo: `{ "error": "Não foi possível calcular as próximas cobranças." }`,
          },
        ],
      },
      {
        metodo: 'POST',
        caminho: '/subscriptions/notify-upcoming',
        resumo:
          'Dispara manualmente o envio de e-mails de lembrete para as cobranças próximas. Útil para testar o SMTP sem esperar o agendamento. Se um envio falhar, o erro aparece em resultados (sucesso: false) e a resposta continua 200.',
        respostas: [
          {
            status: 200,
            descricao: 'Processamento concluído.',
            exemplo: `{
  "sucesso": true,
  "quantidade": 1,
  "resultados": [
    {
      "id": 1,
      "nome": "Netflix",
      "diasRestantes": 3,
      "sucesso": true,
      "messageId": "<abc123@smtp>"
    }
  ]
}`,
          },
          {
            status: 500,
            descricao: 'Falha geral ao disparar.',
            exemplo: `{
  "sucesso": false,
  "erro": "Não foi possível disparar as notificações."
}`,
          },
        ],
      },
    ],
  },
  {
    id: 'estatisticas',
    titulo: 'Estatísticas',
    descricao: 'Dados para os gráficos do painel (US7 e US8).',
    endpoints: [
      {
        metodo: 'GET',
        caminho: '/stats/monthly-evolution',
        resumo:
          'Gasto total por mês nos últimos 12 meses, em ordem cronológica. Considera data_inicio e cancelado_em de cada assinatura.',
        respostas: [
          {
            status: 200,
            descricao: 'Série mensal (trecho).',
            exemplo: `[
  { "mes": "2026-08", "total": 89.8 },
  { "mes": "2026-09", "total": 129.7 }
]`,
          },
          {
            status: 500,
            descricao: 'Falha ao calcular.',
            exemplo: `{ "error": "Não foi possível calcular o histórico mensal de gastos." }`,
          },
        ],
      },
      {
        metodo: 'GET',
        caminho: '/stats/by-category',
        resumo:
          'Total gasto por categoria, só de assinaturas ativas. Sempre devolve as 5 categorias, mesmo com total 0.',
        respostas: [
          {
            status: 200,
            descricao: 'Totais por categoria.',
            exemplo: `[
  { "categoria": "streaming", "total": 79.8 },
  { "categoria": "produtividade", "total": 49.9 },
  { "categoria": "jogos", "total": 0 },
  { "categoria": "academia", "total": 0 },
  { "categoria": "outros", "total": 0 }
]`,
          },
          {
            status: 500,
            descricao: 'Falha ao calcular.',
            exemplo: `{ "error": "Não foi possível calcular os gastos por categoria." }`,
          },
        ],
      },
    ],
  },
  {
    id: 'sistema',
    titulo: 'Sistema',
    descricao: 'Verificação de que a API está no ar.',
    endpoints: [
      {
        metodo: 'GET',
        caminho: '/health',
        resumo: 'Retorna 200 quando o servidor está funcionando.',
        respostas: [{ status: 200, descricao: 'API no ar.', exemplo: `{ "status": "ok" }` }],
      },
    ],
  },
];
