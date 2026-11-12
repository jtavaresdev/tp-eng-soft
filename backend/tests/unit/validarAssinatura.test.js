// Área 1 — Assinaturas (CRUD) · US1, US5, US8
// Alvo: validarAssinatura em src/services/subscriptionsService.js
//
// Teste de UNIDADE: função pura, sem banco e sem HTTP.
import { describe, expect, it } from 'vitest';
import {
  CATEGORIAS_VALIDAS,
  validarAssinatura,
  validarNovaAssinatura,
} from '../../src/services/subscriptionsService.js';
import { dadosAssinatura } from '../helpers/banco.js';

const ERRO_NOME = "O campo 'nome' é obrigatório";
const ERRO_VALOR = "O campo 'valor' deve ser maior que zero";
const ERRO_DATA_COBRANCA = "O campo 'data_cobranca' deve estar no formato AAAA-MM-DD";
const ERRO_DATA_INICIO = "O campo 'data_inicio' deve estar no formato AAAA-MM-DD";
const ERRO_CATEGORIA = 'Categoria inválida. Use: streaming, produtividade, jogos, academia, outros';

describe('validarAssinatura', () => {
  it('não retorna erros para uma assinatura válida', () => {
    expect(validarAssinatura(dadosAssinatura())).toEqual([]);
  });

  it.each([
    ['ausente', undefined],
    ['vazio', ''],
    ['só espaços', '   '],
  ])('exige o nome (%s)', (_caso, nome) => {
    expect(validarAssinatura(dadosAssinatura({ nome }))).toEqual([ERRO_NOME]);
  });

  it('rejeita nome que não seja string', () => {
    expect(validarAssinatura(dadosAssinatura({ nome: 123 }))).toEqual([ERRO_NOME]);
  });

  it.each([
    ['zero', 0],
    ['negativo', -10],
    ['texto numérico', '39.90'],
    ['ausente', undefined],
    ['NaN', Number.NaN],
    ['infinito', Number.POSITIVE_INFINITY],
  ])('rejeita valor inválido (%s)', (_caso, valor) => {
    expect(validarAssinatura(dadosAssinatura({ valor }))).toEqual([ERRO_VALOR]);
  });

  it.each([
    ['ausente', undefined],
    ['formato brasileiro', '05/10/2026'],
    ['sem zeros à esquerda', '2026-1-5'],
    ['com horário', '2026-10-05T00:00:00Z'],
  ])('rejeita data_cobranca fora do formato AAAA-MM-DD (%s)', (_caso, data_cobranca) => {
    expect(validarAssinatura(dadosAssinatura({ data_cobranca }))).toEqual([ERRO_DATA_COBRANCA]);
  });

  it.each([
    ['ausente', undefined],
    ['vazia', ''],
    ['formato brasileiro', '05/01/2026'],
  ])('rejeita data_inicio fora do formato AAAA-MM-DD (%s)', (_caso, data_inicio) => {
    expect(validarAssinatura(dadosAssinatura({ data_inicio }))).toEqual([ERRO_DATA_INICIO]);
  });

  it.each([
    ['ausente', undefined],
    ['desconhecida', 'musica'],
    ['com maiúscula', 'Streaming'],
  ])('rejeita categoria fora de CATEGORIAS_VALIDAS (%s)', (_caso, categoria) => {
    expect(validarAssinatura(dadosAssinatura({ categoria }))).toEqual([ERRO_CATEGORIA]);
  });

  it.each(CATEGORIAS_VALIDAS)('aceita a categoria "%s"', (categoria) => {
    expect(validarAssinatura(dadosAssinatura({ categoria }))).toEqual([]);
  });

  it('retorna todos os erros de uma vez, na ordem dos campos', () => {
    const erros = validarAssinatura({
      nome: '',
      valor: 0,
      data_cobranca: 'ontem',
      data_inicio: 'hoje',
      categoria: 'musica',
    });

    expect(erros).toEqual([
      ERRO_NOME,
      ERRO_VALOR,
      ERRO_DATA_COBRANCA,
      ERRO_DATA_INICIO,
      ERRO_CATEGORIA,
    ]);
  });

  it('não quebra quando chamada sem argumento', () => {
    expect(validarAssinatura()).toHaveLength(5);
  });

  it('mantém validarNovaAssinatura como o mesmo validador', () => {
    expect(validarNovaAssinatura).toBe(validarAssinatura);
  });
});
