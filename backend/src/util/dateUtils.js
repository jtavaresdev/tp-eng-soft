
const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function hojeUTC() {
  const agora = new Date();
  return new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()));
}

function ultimoDiaDoMes(ano, mesIndex) {
  return new Date(Date.UTC(ano, mesIndex + 1, 0)).getUTCDate();
}

function montarDataClampeada(ano, mesIndex, dia) {
  const diaValido = Math.min(dia, ultimoDiaDoMes(ano, mesIndex));
  return new Date(Date.UTC(ano, mesIndex, diaValido));
}

export function calcularProximaCobranca(dataCobranca, referencia = hojeUTC()) {
  const diaCobranca = dataCobranca.getUTCDate();

  let candidato = montarDataClampeada(
    referencia.getUTCFullYear(),
    referencia.getUTCMonth(),
    diaCobranca,
  );

  if (candidato < referencia) {
    let mesIndex = referencia.getUTCMonth() + 1;
    let ano = referencia.getUTCFullYear();

    if (mesIndex > 11) {
      mesIndex = 0;
      ano += 1;
    }

    candidato = montarDataClampeada(ano, mesIndex, diaCobranca);
  }

  return candidato;
}

export function diferencaEmDias(dataFutura, dataReferencia) {
  return Math.round((dataFutura.getTime() - dataReferencia.getTime()) / MS_POR_DIA);
}

export function formatarDataISO(data) {
  const ano = data.getUTCFullYear();
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(data.getUTCDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

const REGEX_DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
 
export function parseDataISOParaUTC(texto) {
  if (typeof texto !== 'string') return null;
 
  const match = REGEX_DATA_ISO.exec(texto);
  if (!match) return null;
 
  const [, anoStr, mesStr, diaStr] = match;
  const ano = Number(anoStr);
  const mes = Number(mesStr); // 1-based, como digitado
  const dia = Number(diaStr);
 
  const data = new Date(Date.UTC(ano, mes - 1, dia));
 
  const dataValida =
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia;
 
  return dataValida ? data : null;
}