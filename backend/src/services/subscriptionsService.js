import { Decimal } from 'decimal.js';

import { 
  getResumoAssinaturasAtivas,
  getAssinaturasParaHistorico,
 } from '../repositories/subscriptionRepository.js';
import db from '../db/index.js';

export const CATEGORIAS_VALIDAS = [
  'streaming',
  'produtividade',
  'jogos',
  'academia',
  'outros',
];

// A edição usa exatamente as mesmas regras do cadastro.
export function validarAssinatura(dados = {}) {
  const erros = [];

  if (!dados.nome || typeof dados.nome !== 'string' || !dados.nome.trim()) {
    erros.push("O campo 'nome' é obrigatório");
  }

  if (
    typeof dados.valor !== 'number' ||
    !Number.isFinite(dados.valor) ||
    dados.valor <= 0
  ) {
    erros.push("O campo 'valor' deve ser maior que zero");
  }

  if (!dados.data_cobranca || !/^\d{4}-\d{2}-\d{2}$/.test(dados.data_cobranca)) {
    erros.push("O campo 'data_cobranca' deve estar no formato AAAA-MM-DD");
  }

  if (!CATEGORIAS_VALIDAS.includes(dados.categoria)) {
    erros.push(`Categoria inválida. Use: ${CATEGORIAS_VALIDAS.join(', ')}`);
  }

  return erros;
}

// Mantém o nome usado pela implementação original da US1-BE.
export const validarNovaAssinatura = validarAssinatura;

export function buscarAssinaturaPorId(id) {
  return db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(id);
}

export function buscarAssinaturas(status = 'ativo') {
  return db
    .prepare('SELECT * FROM subscriptions WHERE status = ? ORDER BY data_cobranca')
    .all(status);
}

export function criarAssinatura({ nome, valor, data_cobranca, categoria }) {
  const resultado = db
    .prepare(`
      INSERT INTO subscriptions (nome, valor, data_cobranca, categoria)
      VALUES (?, ?, ?, ?)
    `)
    .run(nome.trim(), valor, data_cobranca, categoria);

  return buscarAssinaturaPorId(resultado.lastInsertRowid);
}

export function atualizarAssinatura(
  id,
  { nome, valor, data_cobranca, categoria },
) {
  const existente = buscarAssinaturaPorId(id);

  if (!existente) {
    return null;
  }

  db.prepare(`
    UPDATE subscriptions
    SET nome = ?, valor = ?, data_cobranca = ?, categoria = ?
    WHERE id = ?
  `).run(nome.trim(), valor, data_cobranca, categoria, id);

  return buscarAssinaturaPorId(id);
}

export function cancelarAssinatura(id) {
  const existente = db
    .prepare('SELECT * FROM subscriptions WHERE id = ? AND status = ?')
    .get(id, 'ativo');

  if (!existente) {
    return null;
  }

  db.prepare(`
    UPDATE subscriptions
    SET status = 'cancelado', cancelado_em = datetime('now')
    WHERE id = ?
  `).run(id);

  return buscarAssinaturaPorId(id);
}


export async function calcularResumoMensal() {
  const { somaValor, quantidade } = await getResumoAssinaturasAtivas();
 
  const totalMensal = somaValor ? Number(somaValor.toFixed(2)) : 0;
 
  return {
    totalMensal,
    quantidadeAtivas: quantidade,
  };
}

function paraIndiceDeMes(data) {
  const d = data instanceof Date ? data : new Date(data);
  return d.getFullYear() * 12 + d.getMonth();
}
 
function gerarUltimos12Meses(referencia) {
  const meses = [];
 
  for (let deslocamento = 11; deslocamento >= 0; deslocamento--) {
    const data = new Date(referencia.getFullYear(), referencia.getMonth() - deslocamento, 1);
    const ano = data.getFullYear();
    const mes = data.getMonth(); // 0-based
 
    meses.push({
      indice: ano * 12 + mes,
      chave: `${ano}-${String(mes + 1).padStart(2, '0')}`, // "YYYY-MM"
    });
  }
 
  return meses;
}
 
function estavaAtivaNoMes(assinatura, indiceDoMes) {
  const indiceInicio = paraIndiceDeMes(assinatura.criado_em);
  const indiceFim = assinatura.cancelado_em ? paraIndiceDeMes(assinatura.cancelado_em) : null;
 
  const jaFoiCriada = indiceInicio <= indiceDoMes;
  const aindaNaoFoiCancelada = indiceFim === null || indiceDoMes <= indiceFim;
 
  return jaFoiCriada && aindaNaoFoiCancelada;
}
 
export async function calcularHistoricoMensal(referencia = new Date()) {
  const assinaturas = await getAssinaturasParaHistorico();
  const meses = gerarUltimos12Meses(referencia);
 
  return meses.map(({ indice, chave }) => {
    const somaDoMes = assinaturas.reduce((acumulado, assinatura) => {
      if (!estavaAtivaNoMes(assinatura, indice)) return acumulado;
      
      const valor = typeof assinatura.valor?.toNumber === 'function' 
        ? assinatura.valor.toNumber() 
        : Number(assinatura.valor) || 0;
    
      return acumulado + valor;
    }, 0);
 
    return {
      mes: chave,
      total: Number(somaDoMes.toFixed(2)),
    };
  });
}