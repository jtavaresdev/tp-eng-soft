import { randomUUID } from 'node:crypto';

// Roda antes de CADA arquivo de teste, antes de qualquer import do src/.
// Como as variáveis já estão definidas aqui, o dotenv não as sobrescreve
// com o que estiver no .env do desenvolvedor.

// Cada arquivo de teste ganha um SQLite próprio e vazio (nunca o dev.db).
process.env.DB_PATH = `file:./data/test/${randomUUID()}.db`;
process.env.DATABASE_URL = '';

// Nenhum teste pode enviar e-mail de verdade nem ligar o cron.
process.env.NODE_ENV = 'test';
process.env.NOTIFICATION_SCHEDULER_ENABLED = 'false';
process.env.NOTIFY_DRY_RUN = 'true';
process.env.NOTIFY_EMAIL_TO = 'teste@exemplo.com';
process.env.NOTIFY_DAYS_BEFORE = '3';
process.env.MAIL_FROM = 'SubFlow Teste <no-reply@exemplo.com>';
process.env.SMTP_HOST = 'smtp.invalid';
process.env.SMTP_PORT = '587';
process.env.SMTP_SECURE = 'false';
process.env.SMTP_USER = 'usuario-teste';
process.env.SMTP_PASS = 'senha-teste';
