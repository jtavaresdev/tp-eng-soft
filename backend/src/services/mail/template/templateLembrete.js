const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatoData = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC', // consistente com o resto do backend, que trabalha em UTC
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function montarLembreteEmail({ nome, valor, dataCobranca }) {
  const valorFormatado = formatoMoeda.format(Number(valor));
  const dataFormatada = formatoData.format(
    dataCobranca instanceof Date ? dataCobranca : new Date(dataCobranca),
  );

  const assunto = `Lembrete: cobrança de "${nome}" em breve`;

  const texto = [
    'Olá!',
    '',
    `Este é um lembrete de que a assinatura "${nome}" será cobrada em breve.`,
    '',
    `Valor: ${valorFormatado}`,
    `Data de cobrança: ${dataFormatada}`,
    '',
    '— SubFlow',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #0A0A1F; max-width: 480px; margin: 0 auto;">
      <h2 style="margin-bottom: 4px;">Lembrete de cobrança</h2>
      <p>Olá! A assinatura abaixo será cobrada em breve:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #555;">Assinatura</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${nome}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;">Valor</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${valorFormatado}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;">Data de cobrança</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${dataFormatada}</td>
        </tr>
      </table>
      <p style="color: #777; font-size: 12px;">Enviado automaticamente pelo SubFlow.</p>
    </div>
  `.trim();

  return { assunto, texto, html };
}