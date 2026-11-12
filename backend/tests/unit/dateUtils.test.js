// Área 2 — Datas, próximas cobranças e e-mail · US4
// Alvo: src/util/dateUtils.js
//
// Teste de UNIDADE: funções puras. Sempre monte as datas em UTC
// (`new Date(Date.UTC(ano, mesIndex, dia))`), como o backend faz.
// Para implementar um caso, troque `it.todo('...')` por `it('...', () => { ... })`.
import { describe, expect, it } from 'vitest';
import {
  calcularProximaCobranca,
  diferencaEmDias,
  formatarDataISO,
  hojeUTC,
  parseDataISOParaUTC,
} from '../../src/util/dateUtils.js';

const utc = (ano, mes, dia) => new Date(Date.UTC(ano, mes - 1, dia));

describe('calcularProximaCobranca', () => {
  // Exemplo pronto
  it('mantém a cobrança no mês atual quando o dia ainda não passou', () => {
    const proxima = calcularProximaCobranca(utc(2026, 1, 20), utc(2026, 10, 5));

    expect(formatarDataISO(proxima)).toBe('2026-10-20');
  });

  it.todo('considera o próprio dia de referência como próxima cobrança');
  it.todo('vai para o mês seguinte quando o dia já passou');
  it.todo('vira o ano quando a referência está em dezembro e o dia já passou');
  it.todo('ajusta dia 31 para o último dia de um mês mais curto (ex: fevereiro)');
  it.todo('usa hojeUTC() quando a referência não é informada (vi.useFakeTimers)');
});

describe('diferencaEmDias', () => {
  it.todo('retorna 0 para a mesma data');
  it.todo('retorna a quantidade de dias entre duas datas, inclusive virando o mês');
  it.todo('retorna negativo quando a data futura é anterior à referência');
});

describe('formatarDataISO', () => {
  it.todo('formata em AAAA-MM-DD com zeros à esquerda');
});

describe('parseDataISOParaUTC', () => {
  it.todo('converte "2026-02-25" para a data UTC correspondente');
  it.todo('retorna null para formato inválido (ex: "25/02/2026", "2026-2-5")');
  it.todo('retorna null para data inexistente (ex: "2026-02-30")');
  it.todo('retorna null quando o valor não é string');
});

describe('hojeUTC', () => {
  it.todo('retorna a data atual à meia-noite UTC (vi.useFakeTimers + vi.setSystemTime)');
});
