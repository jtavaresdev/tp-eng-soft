import { getTransporter } from './mailer.js';
import { montarLembreteEmail } from './template/templateLembrete.js';

export async function enviarLembrete(assinatura) {
  const destinatario = assinatura.destinatario ?? process.env.NOTIFY_EMAIL_TO;

  if (!destinatario) {
    const mensagem = 'NOTIFY_EMAIL_TO não configurado no .env — lembrete não enviado.';
    console.error(`[email.service] ${mensagem}`);
    return { sucesso: false, erro: mensagem };
  }

  try {
    const transporter = getTransporter(); // pode lançar se o .env de SMTP estiver incompleto
    const { assunto, texto, html } = montarLembreteEmail(assinatura);

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: destinatario,
      subject: assunto,
      text: texto,
      html,
    });

    console.log(
      `[email.service] Lembrete de "${assinatura.nome}" enviado (messageId: ${info.messageId}).`,
    );

    return { sucesso: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[email.service] Falha ao enviar lembrete de "${assinatura.nome}":`, error);
    return { sucesso: false, erro: error.message };
  }
}