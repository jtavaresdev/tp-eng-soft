// Área 4 — Job de notificações · US4
// Alvo: criarTransporter, enviarLembrete, iniciarAgendamentoNotificacoes e
//       pararAgendamentoNotificacoes em src/services/notificationService.js
//
// Teste de UNIDADE com INJEÇÃO de dependência: as funções recebem `env`,
// `logger` e `transporter` por parâmetro, então basta passar dublês.
// Para implementar um caso, troque `it.todo('...')` por `it('...', async () => { ... })`.
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  criarTransporter,
  enviarLembrete,
  iniciarAgendamentoNotificacoes,
  pararAgendamentoNotificacoes,
} from '../../src/services/notificationService.js';

afterEach(() => {
  pararAgendamentoNotificacoes(); // nenhum cron pode ficar ligado entre testes
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

  it.todo('lança erro quando SMTP_HOST não está configurado');
  it.todo('lança erro quando SMTP_PORT é inválida');
  it.todo('lança erro quando só SMTP_USER ou só SMTP_PASS é informado');
  it.todo('cria um transporter SMTP real quando a configuração está completa');
});

describe('enviarLembrete', () => {
  it.todo('lança erro quando não há destinatário');
  it.todo('lança erro quando não há transporter');
  it.todo('chama sendMail com from, to, subject, text e html do lembrete');
  it.todo('usa o remetente padrão quando MAIL_FROM não está definido (vi.stubEnv)');
});

describe('iniciarAgendamentoNotificacoes', () => {
  it.todo('retorna null quando NOTIFICATION_SCHEDULER_ENABLED é "false"');
  it.todo('lança erro quando a expressão cron é inválida (vi.stubEnv para habilitar)');
  it.todo('agenda a tarefa e devolve a mesma tarefa em uma segunda chamada');
  it.todo('permite agendar de novo depois de pararAgendamentoNotificacoes()');
});

// Já importados para os casos acima: enviarLembrete, iniciarAgendamentoNotificacoes.
