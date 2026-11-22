// Área 2 — Datas, próximas cobranças e e-mail · US4
// Alvo: src/services/mail/ (emailService.js, mailer.js, template/templateLembrete.js)
//
// Teste de UNIDADE com MOCK de módulo: o nodemailer é substituído por um
// dublê, então nenhum e-mail sai de verdade e dá para inspecionar o que
// seria enviado.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import nodemailer from 'nodemailer';
import { enviarLembrete } from '../../src/services/mail/emailService.js';
import { getTransporter, resetTransporter } from '../../src/services/mail/mailer.js';
import { montarLembreteEmail } from '../../src/services/mail/template/templateLembrete.js';

vi.mock('nodemailer', () => ({ default: { createTransport: vi.fn() } }));

const sendMail = vi.fn();

// Ambiente fixo: os testes não dependem do que o setup global ou o .env definem.
const ENV_PADRAO = {
  SMTP_HOST: 'smtp.exemplo.com',
  SMTP_PORT: '587',
  SMTP_SECURE: 'false',
  SMTP_USER: 'usuario',
  SMTP_PASS: 'senha',
  MAIL_FROM: 'SubFlow <no-reply@exemplo.com>',
  NOTIFY_EMAIL_TO: 'teste@exemplo.com',
};

const assinatura = { nome: 'Netflix', valor: 39.9, dataCobranca: '2026-10-05' };

beforeEach(() => {
  for (const [chave, valor] of Object.entries(ENV_PADRAO)) vi.stubEnv(chave, valor);
  resetTransporter(); // o mailer guarda o transporter em cache
  sendMail.mockReset().mockResolvedValue({ messageId: 'msg-123' });
  nodemailer.createTransport.mockReset().mockReturnValue({ sendMail });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks(); // desfaz o spy de console.error, quando usado
});

describe('emailService.enviarLembrete', () => {
  it('envia o lembrete para NOTIFY_EMAIL_TO e retorna sucesso', async () => {
    const resultado = await enviarLembrete(assinatura);

    expect(resultado).toEqual({ sucesso: true, messageId: 'msg-123' });
    expect(sendMail).toHaveBeenCalledOnce();
    expect(sendMail.mock.calls[0][0]).toMatchObject({
      to: 'teste@exemplo.com',
      subject: 'Lembrete: cobrança de "Netflix" em breve',
    });
  });

  it('usa assinatura.destinatario quando informado', async () => {
    const resultado = await enviarLembrete({ ...assinatura, destinatario: 'outro@exemplo.com' });

    expect(resultado.sucesso).toBe(true);
    expect(sendMail.mock.calls[0][0].to).toBe('outro@exemplo.com');
  });

  it('retorna sucesso false quando NOTIFY_EMAIL_TO não está configurado (vi.stubEnv)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubEnv('NOTIFY_EMAIL_TO', '');

    const resultado = await enviarLembrete(assinatura);

    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro).toMatch(/NOTIFY_EMAIL_TO/);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('retorna sucesso false com a mensagem de erro quando o sendMail rejeita', async () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
    sendMail.mockRejectedValue(new Error('SMTP fora do ar'));

    const resultado = await enviarLembrete(assinatura);

    expect(resultado).toEqual({ sucesso: false, erro: 'SMTP fora do ar' });
    expect(erro).toHaveBeenCalled(); // a falha foi registrada em log, não propagada
  });

  it('retorna sucesso false quando a configuração de SMTP está incompleta', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubEnv('SMTP_HOST', '');

    const resultado = await enviarLembrete(assinatura);

    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro).toMatch(/SMTP/);
    expect(sendMail).not.toHaveBeenCalled();
  });
});

describe('mailer.getTransporter', () => {
  it('cria o transporter com host, porta, secure e auth lidos do ambiente', () => {
    vi.stubEnv('SMTP_HOST', 'smtp.teste.com');
    vi.stubEnv('SMTP_PORT', '465');
    vi.stubEnv('SMTP_SECURE', 'true');
    vi.stubEnv('SMTP_USER', 'meu_usuario');
    vi.stubEnv('SMTP_PASS', 'minha_senha');

    getTransporter();

    expect(nodemailer.createTransport).toHaveBeenCalledOnce();
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.teste.com',
        port: 465, // convertida para número
        secure: true, // "true" no .env vira booleano
        auth: { user: 'meu_usuario', pass: 'minha_senha' },
      }),
    );
  });

  it('usa secure false quando SMTP_SECURE é "false" (STARTTLS na 587)', () => {
    getTransporter();

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 587, secure: false }),
    );
  });

  it('reaproveita o mesmo transporter em chamadas seguidas', () => {
    const primeiro = getTransporter();
    const segundo = getTransporter();

    expect(segundo).toBe(primeiro);
    expect(nodemailer.createTransport).toHaveBeenCalledOnce();
  });

  it('cria um novo transporter depois de resetTransporter()', () => {
    nodemailer.createTransport.mockImplementation(() => ({ sendMail })); // um objeto novo por chamada

    const antes = getTransporter();
    resetTransporter();
    const depois = getTransporter();

    expect(nodemailer.createTransport).toHaveBeenCalledTimes(2);
    expect(depois).not.toBe(antes);
  });

  it.each(['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'])(
    'lança erro quando falta %s',
    (variavel) => {
      vi.stubEnv(variavel, '');

      expect(() => getTransporter()).toThrow(/SMTP/);
      expect(nodemailer.createTransport).not.toHaveBeenCalled();
    },
  );
});

describe('montarLembreteEmail', () => {
  it('monta o assunto com o nome da assinatura', () => {
    const { assunto } = montarLembreteEmail(assinatura);

    expect(assunto).toBe('Lembrete: cobrança de "Netflix" em breve');
  });

  it('formata o valor em reais (R$ 39,90) no texto e no html', () => {
    const { texto, html } = montarLembreteEmail(assinatura);

    // \s casa o espaço inseparável que o Intl coloca depois de "R$".
    expect(texto).toMatch(/R\$\s39,90/);
    expect(html).toMatch(/R\$\s39,90/);
  });

  it('formata a data de cobrança em DD/MM/AAAA, aceitando string ou Date', () => {
    const comString = montarLembreteEmail({ ...assinatura, dataCobranca: '2026-10-05' });
    const comDate = montarLembreteEmail({
      ...assinatura,
      dataCobranca: new Date(Date.UTC(2026, 9, 5)),
    });

    for (const { texto, html } of [comString, comDate]) {
      expect(texto).toContain('05/10/2026');
      expect(html).toContain('05/10/2026');
    }
  });
});