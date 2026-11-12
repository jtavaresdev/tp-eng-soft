// Área 1 — Assinaturas (CRUD) · US1, US5, US8
// Alvo: validarAssinatura em src/services/subscriptionsService.js
//
// Teste de UNIDADE: função pura, sem banco e sem HTTP.
// Para implementar um caso, troque `it.todo('...')` por `it('...', () => { ... })`.
import { describe, expect, it } from 'vitest';
import { validarAssinatura } from '../../src/services/subscriptionsService.js';
import { dadosAssinatura } from '../helpers/banco.js';

describe('validarAssinatura', () => {
  // Exemplo pronto
  it('não retorna erros para uma assinatura válida', () => {
    expect(validarAssinatura(dadosAssinatura())).toEqual([]);
  });

  it.todo('exige o nome (ausente, vazio ou só espaços)');
  it.todo('rejeita nome que não seja string');
  it.todo('rejeita valor zero, negativo ou não numérico (ex: "39.90")');
  it.todo('rejeita data_cobranca fora do formato AAAA-MM-DD');
  it.todo('rejeita data_inicio ausente ou fora do formato AAAA-MM-DD');
  it.todo('rejeita categoria fora de CATEGORIAS_VALIDAS');
  it.todo('aceita cada uma das categorias válidas');
  it.todo('retorna todos os erros de uma vez quando vários campos são inválidos');
  it.todo('não quebra quando chamada sem argumento');
});
