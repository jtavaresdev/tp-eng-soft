import db from '../db/index.js';

export const CATEGORIAS_VALIDAS = ['streaming', 'produtividade', 'jogos', 'academia', 'outros'];

// Recebe um objeto (os dados que vieram do formulário/requisição) e
// devolve uma LISTA de erros. Lista vazia [] significa "está tudo certo".
export function validarNovaAssinatura(dados) {
  const erros = [];

  // "!dados.nome" é true se nome for undefined, null ou string vazia ""
  if (!dados.nome || typeof dados.nome !== 'string' || !dados.nome.trim()) {
    erros.push("O campo 'nome' é obrigatório");
  }

  if (typeof dados.valor !== 'number' || dados.valor <= 0) {
    erros.push("O campo 'valor' deve ser maior que zero");
  }

  // regex simples pra checar o formato AAAA-MM-DD
  if (!dados.data_cobranca || !/^\d{4}-\d{2}-\d{2}$/.test(dados.data_cobranca)) {
    erros.push("O campo 'data_cobranca' deve estar no formato AAAA-MM-DD");
  }

  if (!CATEGORIAS_VALIDAS.includes(dados.categoria)) {
    erros.push(`Categoria inválida. Use: ${CATEGORIAS_VALIDAS.join(', ')}`);
  }

  return erros;
}

export function criarAssinatura({ nome, valor, data_cobranca, categoria }) {
  const inserir = db.prepare(`
    INSERT INTO subscriptions (nome, valor, data_cobranca, categoria)
    VALUES (?, ?, ?, ?)
  `);

  const resultado = inserir.run(nome.trim(), valor, data_cobranca, categoria);

  return buscarAssinaturaPorId(resultado.lastInsertRowid);
}

export function buscarAssinaturaPorId(id) {
  return db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(id);
}

export function buscarAssinaturas(status = "ativo") {
  return db.prepare('SELECT * FROM subscriptions WHERE status = ? ORDER BY data_cobranca;')
    .all(status);
}
