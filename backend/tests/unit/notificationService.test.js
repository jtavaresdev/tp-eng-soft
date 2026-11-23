// Área 4 — Job de notificações · US4
// Alvo: criarTransporter, enviarLembrete, iniciarAgendamentoNotificacoes e
//       pararAgendamentoNotificacoes em src/services/notificationService.js
//
// Teste de UNIDADE com INJEÇÃO de dependência: as funções recebem `env`,
// `logger` e `transporter` por parâmetro, então basta passar dublês.
// Os testes usam dublês para e-mail e ambiente; nenhum envio real é feito.
import { afterEach, describe, expect, it, vi } from 'vitest';
import nodemailer from 'nodemailer';
import {
  criarTransporter,
  enviarLembrete,
  iniciarAgendamentoNotificacoes,
  pararAgendamentoNotificacoes,
} from '../../src/services/notificationService.js';

const { createTransportMock } = vi.hoisted(() => ({
  createTransportMock: vi.fn((opcoes) => ({ opcoes })),
}));

vi.mock('nodemailer', () => ({
  default: { createTransport: createTransportMock },
}));

afterEach(() => {
  pararAgendamentoNotificacoes(); // nenhum cron pode ficar ligado entre testes
  vi.unstubAllEnvs();
  createTransportMock.mockClear();
});

describe('criarTransporter', () => {
  // Exemplo pronto
  it('em dry-run devolve um transporter que só registra o envio', async () => {
    const logger = { log: vi.fn() };
    const transporter = criarTransporter({ env: { NOTIFY_DRY_RUN: 'true' }, logger });

    const resultado = await transporter.sendMail({ to: 'alguem@exemplo.com' });

    expect(resultado).toEqual({ accepted: ['alguem@exemplo.com'], messageId: 'dry-run' });
    expect(logger.log).toHaveBeenCalledOnce();
  });

  it('lança erro quando SMTP_HOST não está configurado', () => {
    expect(() => criarTransporter({ env: { SMTP_PORT: '587' } }))
      .toThrow('SMTP não configurado. Informe SMTP_HOST e SMTP_PORT.');
  });

  it('lança erro quando SMTP_PORT é inválida', () => {
    expect(() => criarTransporter({ env: { SMTP_HOST: 'smtp.exemplo.com', SMTP_PORT: '587.5' } }))
      .toThrow('SMTP não configurado. Informe SMTP_HOST e SMTP_PORT.');
  });

  it('lança erro quando só SMTP_USER ou só SMTP_PASS é informado', () => {
    const envBase = { SMTP_HOST: 'smtp.exemplo.com', SMTP_PORT: '465' };

    expect(() => criarTransporter({ env: { ...envBase, SMTP_USER: 'usuario' } }))
      .toThrow('SMTP_USER e SMTP_PASS devem ser informados juntos.');
    expect(() => criarTransporter({ env: { ...envBase, SMTP_PASS: 'senha' } }))
      .toThrow('SMTP_USER e SMTP_PASS devem ser informados juntos.');
  });

  it('delega ao Nodemailer com a configuração SMTP completa', () => {
    const transporter = criarTransporter({
      env: {
        SMTP_HOST: ' smtp.exemplo.com ',
        SMTP_PORT: '465',
        SMTP_SECURE: 'true',
        SMTP_USER: ' usuario ',
        SMTP_PASS: 'senha',
      },
    });

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.exemplo.com',
      port: 465,
      secure: true,
      auth: { user: 'usuario', pass: 'senha' },
    });
    expect(transporter).toEqual({
      opcoes: {
        host: 'smtp.exemplo.com',
        port: 465,
        secure: true,
        auth: { user: 'usuario', pass: 'senha' },
      },
    });
  });
});

describe('enviarLembrete', () => {
  const assinatura = {
    nome: 'Netflix',
    valor: 39.9,
    proximaCobranca: '2026-10-05',
  };

  it('lança erro quando não há destinatário', async () => {
    await expect(enviarLembrete(assinatura, { destinatario: '', transporter: { sendMail: vi.fn() } }))
      .rejects.toThrow('NOTIFY_EMAIL_TO não configurado.');
  });

  it('lança erro quando não há transporter', async () => {
    await expect(enviarLembrete(assinatura, { destinatario: 'destino@exemplo.com' }))
      .rejects.toThrow('Transporter de e-mail não configurado.');
  });

  it('chama sendMail com from, to, subject, text e html do lembrete', async () => {
    const transporter = { sendMail: vi.fn().mockResolvedValue({ messageId: 'abc' }) };

    await enviarLembrete(assinatura, { transporter, destinatario: 'cliente@exemplo.com' });

    expect(transporter.sendMail).toHaveBeenCalledOnce();
    expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'SubFlow Teste <no-reply@exemplo.com>',
      to: 'cliente@exemplo.com',
      subject: expect.stringContaining('Netflix'),
      text: expect.stringContaining('Netflix'),
      html: expect.stringContaining('Netflix'),
    }));
  });

  it('usa o remetente padrão quando MAIL_FROM não está definido (vi.stubEnv)', async () => {
    vi.stubEnv('MAIL_FROM', '');
    const transporter = { sendMail: vi.fn().mockResolvedValue({}) };

    await enviarLembrete(assinatura, { transporter, destinatario: 'cliente@exemplo.com' });

    expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'Gerenciador de Assinaturas <no-reply@localhost>',
    }));
  });
});

describe('iniciarAgendamentoNotificacoes', () => {
  it.todo('retorna null quando NOTIFICATION_SCHEDULER_ENABLED é "false"');
  it.todo('lança erro quando a expressão cron é inválida (vi.stubEnv para habilitar)');
  it.todo('agenda a tarefa e devolve a mesma tarefa em uma segunda chamada');
  it.todo('permite agendar de novo depois de pararAgendamentoNotificacoes()');
});

// Já importados para os casos acima: enviarLembrete, iniciarAgendamentoNotificacoes.
