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
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; background-color: #F3F3FB; font-family: 'IBM Plex Sans', Arial, sans-serif; color: #0A0A1F;">
        <div style="max-width: 480px; margin: 24px auto; background-color: #FFFFFF; border: 1px solid #E2E2F0; border-radius: 2px; overflow: hidden;">

          <div style="background-color: #1B1BF0; padding: 16px 24px; text-align: left;">
            <span style="font-family: 'Big Shoulders Display', 'Arial Black', sans-serif; font-weight: 800; font-size: 24px; color: #FFFFFF; letter-spacing: 0.5px; text-transform: uppercase;">
              SubFlow
            </span>
          </div>

          <div style="padding: 24px;">
            <div style="display: inline-block; background-color: #FFF0ED; border: 1px solid #FF5A36; color: #FF5A36; font-size: 11px; font-weight: 600; text-transform: uppercase; padding: 2px 8px; border-radius: 2px; margin-bottom: 12px; letter-spacing: 0.5px;">
              Aviso de Cobrança Próxima
            </div>

            <h2 style="font-family: 'Big Shoulders Display', 'Arial Black', sans-serif; font-weight: 800; font-size: 28px; text-transform: uppercase; margin: 0 0 8px 0; color: #0A0A1F; line-height: 1.1;">
              Lembrete de cobrança
            </h2>

            <p style="font-size: 14px; line-height: 1.5; color: #4A4A68; margin: 0 0 20px 0;">
              Olá! A assinatura abaixo será cobrada em breve:
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #F3F3FB; border: 1px solid #E2E2F0;">
              <tr>
                <td style="padding: 12px 16px; font-size: 13px; color: #5B5B7B; border-bottom: 1px solid #E2E2F0; font-weight: 500;">
                  Assinatura
                </td>
                <td style="padding: 12px 16px; text-align: right; font-family: 'Big Shoulders Display', 'Arial Black', sans-serif; font-size: 18px; font-weight: 700; color: #0A0A1F; border-bottom: 1px solid #E2E2F0;">
                  ${nome}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; font-size: 13px; color: #5B5B7B; border-bottom: 1px solid #E2E2F0; font-weight: 500;">
                  Valor
                </td>
                <td style="padding: 12px 16px; text-align: right; font-family: 'Big Shoulders Display', 'Arial Black', sans-serif; font-size: 20px; font-weight: 800; color: #1B1BF0; border-bottom: 1px solid #E2E2F0;">
                  ${valorFormatado}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; font-size: 13px; color: #5B5B7B; font-weight: 500;">
                  Data de cobrança
                </td>
                <td style="padding: 12px 16px; text-align: right; font-family: 'IBM Plex Sans', Arial, sans-serif; font-size: 14px; font-weight: 600; color: #0A0A1F;">
                  ${dataFormatada}
                </td>
              </tr>
            </table>

            <p style="color: #8C8CA8; font-size: 12px; margin: 0; text-align: left; border-top: 1px solid #E2E2F0; padding-top: 16px;">
              Enviado automaticamente pelo <strong>SubFlow</strong>.
            </p>
          </div>

        </div>
      </body>
    </html>
  `.trim();

  return { assunto, texto, html };
}
