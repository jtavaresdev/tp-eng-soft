// Área 2 — Datas, próximas cobranças e e-mail · US4
// Alvo: src/util/dateUtils.js
//
// Teste de UNIDADE: funções puras. Sempre monte as datas em UTC
// (`new Date(Date.UTC(ano, mesIndex, dia))`), como o backend faz.
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  calcularProximaCobranca,
  diferencaEmDias,
  formatarDataISO,
  hojeUTC,
  parseDataISOParaUTC,
} from '../../src/util/dateUtils.js';

const utc = (ano, mes, dia) => new Date(Date.UTC(ano, mes - 1, dia));

afterEach(() => {
  vi.useRealTimers();
});

describe('calcularProximaCobranca', () => {
  it('mantém a cobrança no mês atual quando o dia ainda não passou', () => {
    const proxima = calcularProximaCobranca(utc(2026, 1, 20), utc(2026, 10, 5));

    expect(formatarDataISO(proxima)).toBe('2026-10-20');
  });

  it('considera o próprio dia de referência como próxima cobrança', () => {
    const proxima = calcularProximaCobranca(utc(2026, 1, 20), utc(2026, 10, 20));

    expect(formatarDataISO(proxima)).toBe('2026-10-20');
  });

  it('vai para o mês seguinte quando o dia já passou', () => {
    const proxima = calcularProximaCobranca(utc(2026, 1, 5), utc(2026, 10, 20));

    expect(formatarDataISO(proxima)).toBe('2026-11-05');
  });

  it('vira o ano quando a referência está em dezembro e o dia já passou', () => {
    const proxima = calcularProximaCobranca(utc(2026, 1, 5), utc(2026, 12, 20));

    expect(formatarDataISO(proxima)).toBe('2027-01-05');
  });

  it('ajusta dia 31 para o último dia de um mês mais curto (ex: fevereiro)', () => {
    const cobrancaDia31 = utc(2026, 1, 31);

    // Fevereiro de 2026 (28 dias), fevereiro de 2028 (bissexto, 29) e abril (30).
    expect(formatarDataISO(calcularProximaCobranca(cobrancaDia31, utc(2026, 2, 10)))).toBe(
      '2026-02-28',
    );
    expect(formatarDataISO(calcularProximaCobranca(cobrancaDia31, utc(2028, 2, 10)))).toBe(
      '2028-02-29',
    );
    expect(formatarDataISO(calcularProximaCobranca(cobrancaDia31, utc(2026, 4, 10)))).toBe(
      '2026-04-30',
    );
  });

  it('ajusta o dia também quando é o mês seguinte que é mais curto', () => {
    // Dia 30 já passou em 31/01, então a próxima cobrança é em fevereiro (28 dias).
    const proxima = calcularProximaCobranca(utc(2026, 1, 30), utc(2026, 1, 31));

    expect(formatarDataISO(proxima)).toBe('2026-02-28');
  });

  it('usa hojeUTC() quando a referência não é informada (vi.useFakeTimers)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-05T15:30:00Z'));

    const proxima = calcularProximaCobranca(utc(2026, 1, 20));

    expect(formatarDataISO(proxima)).toBe('2026-10-20');
  });
});

describe('diferencaEmDias', () => {
  it('retorna 0 para a mesma data', () => {
    expect(diferencaEmDias(utc(2026, 10, 5), utc(2026, 10, 5))).toBe(0);
  });

  it('retorna a quantidade de dias entre duas datas, inclusive virando o mês', () => {
    expect(diferencaEmDias(utc(2026, 10, 5), utc(2026, 10, 2))).toBe(3);
    expect(diferencaEmDias(utc(2026, 11, 2), utc(2026, 10, 30))).toBe(3);
  });

  it('retorna negativo quando a data futura é anterior à referência', () => {
    expect(diferencaEmDias(utc(2026, 10, 1), utc(2026, 10, 5))).toBe(-4);
  });
});

describe('formatarDataISO', () => {
  it('formata em AAAA-MM-DD com zeros à esquerda', () => {
    expect(formatarDataISO(utc(2026, 3, 7))).toBe('2026-03-07');
    expect(formatarDataISO(utc(2026, 12, 25))).toBe('2026-12-25');
  });
});

describe('parseDataISOParaUTC', () => {
  it('converte "2026-02-25" para a data UTC correspondente', () => {
    const data = parseDataISOParaUTC('2026-02-25');

    expect(data).toEqual(utc(2026, 2, 25));
    expect(data.getUTCHours()).toBe(0);
  });

  it('aceita 29/02 em ano bissexto', () => {
    expect(parseDataISOParaUTC('2028-02-29')).toEqual(utc(2028, 2, 29));
  });

  it('retorna null para formato inválido (ex: "25/02/2026", "2026-2-5")', () => {
    expect(parseDataISOParaUTC('25/02/2026')).toBeNull();
    expect(parseDataISOParaUTC('2026-2-5')).toBeNull();
    expect(parseDataISOParaUTC('2026-02-25T00:00:00Z')).toBeNull();
    expect(parseDataISOParaUTC('')).toBeNull();
  });

  it('retorna null para data inexistente (ex: "2026-02-30")', () => {
    expect(parseDataISOParaUTC('2026-02-30')).toBeNull();
    expect(parseDataISOParaUTC('2026-02-29')).toBeNull(); // 2026 não é bissexto
    expect(parseDataISOParaUTC('2026-13-01')).toBeNull();
    expect(parseDataISOParaUTC('2026-00-10')).toBeNull();
  });

  it('retorna null quando o valor não é string', () => {
    expect(parseDataISOParaUTC(undefined)).toBeNull();
    expect(parseDataISOParaUTC(null)).toBeNull();
    expect(parseDataISOParaUTC(20260225)).toBeNull();
    expect(parseDataISOParaUTC(utc(2026, 2, 25))).toBeNull();
  });
});

describe('hojeUTC', () => {
  it('retorna a data atual à meia-noite UTC (vi.useFakeTimers + vi.setSystemTime)', () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date('2026-10-05T23:59:59.999Z'));
    expect(hojeUTC()).toEqual(utc(2026, 10, 5));

    vi.setSystemTime(new Date('2026-10-05T00:00:00.000Z'));
    expect(hojeUTC()).toEqual(utc(2026, 10, 5));
  });
});