import cron from 'node-cron';
import nodemailer from 'nodemailer';

import { buscarProximasCobrancas } from './subscriptionsService.js';
import { montarLembreteEmail } from './mail/template/templateLembrete.js';
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

  const { assunto, texto, html } = montarLembreteEmail({
    nome: assinatura.nome,
    valor: assinatura.valor,
    dataCobranca: assinatura.proximaCobranca,
  });

  return transporter.sendMail({
    from: process.env.MAIL_FROM || 'Gerenciador de Assinaturas <no-reply@localhost>',
    to: destinatario,
    subject: assunto,
    text: texto,
    html,
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

export function iniciarAgendamentoNotificacoes({
  schedule = process.env.CRON_SCHEDULE || '0 8 * * *',
  timezone = process.env.CRON_TIMEZONE || 'America/Sao_Paulo',
} = {}) {
  if (process.env.NOTIFICATION_SCHEDULER_ENABLED === 'false') {
    return null;
  }

  if (tarefaAgendada) {
    return tarefaAgendada;
  }

  if (!cron.validate(schedule)) {
    throw new Error(`CRON_SCHEDULE inválido: ${schedule}`);
  }

  tarefaAgendada = cron.schedule(schedule, async () => {
    try {
      const resultado = await executarJobNotificacoes();
      console.log('[notifications] job concluído:', resultado);
    } catch (error) {
      console.error('[notifications] erro no job:', error);
    }
  }, { scheduled: true, timezone });

  console.log(`[notifications] job agendado para "${schedule}" (${timezone})`);
  return tarefaAgendada;
}

export function pararAgendamentoNotificacoes() {
  if (tarefaAgendada) {
    tarefaAgendada.stop();
    tarefaAgendada = null;
  }
}
