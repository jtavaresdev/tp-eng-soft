import nodemailer from 'nodemailer';


let transporterInstance = null;

function lerConfiguracaoSMTP() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      'Configuração de SMTP incompleta. Verifique SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS no .env.',
    );
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true', // "true" → SSL (465); "false" → STARTTLS (587)
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  };
}

export function getTransporter() {
  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport(lerConfiguracaoSMTP());
  }
  return transporterInstance;
}

export function resetTransporter() {
  transporterInstance = null;
}