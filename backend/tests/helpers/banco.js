import db from '../../src/db/index.js';

// Apaga todos os dados e reinicia os ids. Chame em um `beforeEach` para que
// um teste nunca dependa do que outro deixou no banco.
export function limparBanco() {
  db.exec(`
    DELETE FROM notification_deliveries;
    DELETE FROM subscriptions;
    DELETE FROM sqlite_sequence;
  `);
}

// Payload válido para POST/PUT /subscriptions. Sobrescreva só o que importa
// para o teste: `dadosAssinatura({ valor: 0 })`.
export function dadosAssinatura(sobrescritas = {}) {
  return {
    nome: 'Netflix',
    valor: 39.9,
    data_cobranca: '2026-10-05',
    data_inicio: '2026-01-05',
    categoria: 'streaming',
    ...sobrescritas,
  };
}

// Insere direto na tabela, permitindo controlar colunas que a API não aceita
// (status, criado_em, cancelado_em). Útil para montar cenários de histórico.
// Retorna a linha inserida.
export function inserirAssinatura(sobrescritas = {}) {
  const linha = {
    ...dadosAssinatura(),
    status: 'ativo',
    criado_em: '2026-01-05 12:00:00',
    cancelado_em: null,
    ...sobrescritas,
  };

  const { lastInsertRowid } = db
    .prepare(`
      INSERT INTO subscriptions
        (nome, valor, data_cobranca, data_inicio, categoria, status, criado_em, cancelado_em)
      VALUES
        (@nome, @valor, @data_cobranca, @data_inicio, @categoria, @status, @criado_em, @cancelado_em)
    `)
    .run(linha);

  return db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(lastInsertRowid);
}
