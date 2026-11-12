// Área 2 — Datas, próximas cobranças e e-mail · US4
// Alvo: src/services/mail/ (emailService.js, mailer.js, template/templateLembrete.js)
//
// Teste de UNIDADE com MOCK de módulo: o nodemailer é substituído por um
// dublê, então nenhum e-mail sai de verdade e dá para inspecionar o que
// seria enviado.
// Para implementar um caso, troque `it.todo('...')` por `it('...', async () => { ... })`.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import nodemailer from 'nodemailer';
import { enviarLembrete } from '../../src/services/mail/emailService.js';
import { getTransporter, resetTransporter } from '../../src/services/mail/mailer.js';
import { montarLembreteEmail } from '../../src/services/mail/template/templateLembrete.js';

vi.mock('nodemailer', () => ({ default: { createTransport: vi.fn() } }));

const sendMail = vi.fn();

beforeEach(() => {
  resetTransporter(); // o mailer guarda o transporter em cache
  sendMail.mockReset().mockResolvedValue({ messageId: 'msg-123' });
  nodemailer.createTransport.mockReset().mockReturnValue({ sendMail });
});

describe('emailService.enviarLembrete', () => {
  // Exemplo pronto
  it('envia o lembrete para NOTIFY_EMAIL_TO e retorna sucesso', async () => {
    const resultado = await enviarLembrete({
      nome: 'Netflix',
      valor: 39.9,
      dataCobranca: '2026-10-05',
    });

    expect(resultado).toEqual({ sucesso: true, messageId: 'msg-123' });
    expect(sendMail).toHaveBeenCalledOnce();
    expect(sendMail.mock.calls[0][0]).toMatchObject({
      to: 'teste@exemplo.com',
      subject: 'Lembrete: cobrança de "Netflix" em breve',
    });
  });

  it.todo('usa assinatura.destinatario quando informado');
  it.todo('retorna sucesso false quando NOTIFY_EMAIL_TO não está configurado (vi.stubEnv)');
  it.todo('retorna sucesso false com a mensagem de erro quando o sendMail rejeita');
  it.todo('retorna sucesso false quando a configuração de SMTP está incompleta');
});

describe('mailer.getTransporter', () => {
  it.todo('cria o transporter com host, porta, secure e auth lidos do ambiente');
  it.todo('reaproveita o mesmo transporter em chamadas seguidas');
  it.todo('cria um novo transporter depois de resetTransporter()');
  it.todo('lança erro quando falta SMTP_HOST, SMTP_PORT, SMTP_USER ou SMTP_PASS');
});

describe('montarLembreteEmail', () => {
  it.todo('monta o assunto com o nome da assinatura');
  it.todo('formata o valor em reais (R$ 39,90) no texto e no html');
  it.todo('formata a data de cobrança em DD/MM/AAAA, aceitando string ou Date');
});

// Já importados para os casos acima: getTransporter, montarLembreteEmail.
