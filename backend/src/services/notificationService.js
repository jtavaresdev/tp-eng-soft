import cron from 'node-cron';
import nodemailer from 'nodemailer';

import { buscarProximasCobrancas } from './subscriptionsService.js';
import { hojeUTC } from '../util/dateUtils.js';
import {
  claimNotification,
  markNotificationFailed,
  markNotificationSent,
} from '../repositories/notificationRepository.js';

const DIAS_ALERTA_PADRAO = 3;
let tarefaAgendada = null;

function obterDiasAlerta() {
  const valor = Number(process.env.NOTIFY_DAYS_BEFORE);
  return Number.isInteger(valor) && valor >= 0 ? valor : DIAS_ALERTA_PADRAO;
}

function valorBooleano(valor) {
  return valor === true || valor === 'true' || valor === '1';
}

export function criarTransporter({ env = process.env, logger = console } = {}) {
  if (valorBooleano(env.NOTIFY_DRY_RUN)) {
    return {
      async sendMail(opcoes) {
        logger.log(`[notifications] dry-run: lembrete para ${opcoes.to}`);
        return { accepted: [opcoes.to], messageId: 'dry-run' };
      },
    };
  }

  const host = String(env.SMTP_HOST || '').trim();
  const port = Number(env.SMTP_PORT || 587);
  const user = String(env.SMTP_USER || '').trim();
  const pass = String(env.SMTP_PASS || '');

  if (!host || !Number.isInteger(port) || port <= 0) {
    throw new Error('SMTP não configurado. Informe SMTP_HOST e SMTP_PORT.');
  }

  if ((user && !pass) || (!user && pass)) {
    throw new Error('SMTP_USER e SMTP_PASS devem ser informados juntos.');
  }

  const opcoes = {
    host,
    port,
    secure: valorBooleano(env.SMTP_SECURE),
  };

  if (user) {
    opcoes.auth = { user, pass };
  }

  return nodemailer.createTransport(opcoes);
}

function formatarValor(valor) {
  return Number(valor).toFixed(2).replace('.', ',');
}

function montarMensagem(assinatura) {
  const dias = assinatura.diasRestantes;
  const unidade = dias === 1 ? 'dia' : 'dias';

  return [
    `Lembrete de renovação: ${assinatura.nome}`,
    '',
    `A assinatura será renovada em ${dias} ${unidade}, no dia ${assinatura.proximaCobranca}.`,
    `Valor: R$ ${formatarValor(assinatura.valor)}.`,
    '',
    'Mensagem enviada pelo Gerenciador de Assinaturas.',
  ].join('\n');
}

export async function enviarLembrete(
  assinatura,
  { transporter, destinatario = process.env.NOTIFY_EMAIL_TO } = {},
) {
  if (!destinatario) {
    throw new Error('NOTIFY_EMAIL_TO não configurado.');
  }

  if (!transporter) {
    throw new Error('Transporter de e-mail não configurado.');
  }

  return transporter.sendMail({
    from: process.env.MAIL_FROM || 'Gerenciador de Assinaturas <no-reply@localhost>',
    to: destinatario,
    subject: `Lembrete de renovação: ${assinatura.nome}`,
    text: montarMensagem(assinatura),
  });
}

function montarResultado(assinatura) {
  return {
    subscriptionId: assinatura.id,
    nome: assinatura.nome,
    cicloCobranca: assinatura.proximaCobranca,
    proximaCobranca: assinatura.proximaCobranca,
  };
}

export async function executarJobNotificacoes({
  diasAlerta = obterDiasAlerta(),
  referencia = hojeUTC(),
  transporter,
  destinatario = process.env.NOTIFY_EMAIL_TO,
} = {}) {
  const assinaturas = await buscarProximasCobrancas({ diasAlerta, referencia });
  const resumo = {
    executadoEm: new Date().toISOString(),
    diasAlerta,
    encontradas: assinaturas.length,
    enviadas: 0,
    ignoradas: 0,
    falhas: 0,
    resultados: [],
  };

  if (assinaturas.length === 0) {
    return resumo;
  }

  let transport = transporter;
  if (!transport) {
    try {
      transport = criarTransporter();
    } catch (error) {
      resumo.falhas = assinaturas.length;
      resumo.resultados = assinaturas.map((assinatura) => ({
        ...montarResultado(assinatura),
        status: 'failed',
        erro: error.message,
      }));
      return resumo;
    }
  }

  for (const assinatura of assinaturas) {
    const resultado = montarResultado(assinatura);
    const claim = claimNotification(assinatura.id, assinatura.proximaCobranca);

    if (!claim.claimed) {
      resumo.ignoradas += 1;
      resumo.resultados.push({
        ...resultado,
        status: 'skipped',
        motivo: claim.delivery?.status || 'already-processed',
      });
      continue;
    }

    try {
      await enviarLembrete(assinatura, { transporter: transport, destinatario });
      markNotificationSent(assinatura.id, assinatura.proximaCobranca);
      resumo.enviadas += 1;
      resumo.resultados.push({ ...resultado, status: 'sent' });
    } catch (error) {
      markNotificationFailed(assinatura.id, assinatura.proximaCobranca, error);
      resumo.falhas += 1;
      resumo.resultados.push({
        ...resultado,
        status: 'failed',
        erro: error.message,
      });
    }
  }

  return resumo;
}

export const runNotificationJob = executarJobNotificacoes;
