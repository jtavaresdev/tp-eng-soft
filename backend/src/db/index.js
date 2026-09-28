import 'dotenv/config';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '../..');

function getDatabasePath() {
  const configuredPath = process.env.DATABASE_URL || process.env.DB_PATH || 'file:./dev.db';
  const sqlitePath = configuredPath.replace(/^file:/, '').split('?')[0];

  return path.isAbsolute(sqlitePath)
    ? sqlitePath
    : path.resolve(backendRoot, sqlitePath);
}

const dbPath = getDatabasePath();
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Garante que a API também funcione em um banco SQLite recém-criado.
db.exec(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    valor REAL NOT NULL,
    data_cobranca TEXT NOT NULL,
    data_inicio TEXT,
    categoria TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ativo',
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    cancelado_em TEXT
  );

  CREATE TABLE IF NOT EXISTS notification_deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id INTEGER NOT NULL,
    ciclo_cobranca TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing',
    tentativa_em TEXT NOT NULL DEFAULT (datetime('now')),
    enviado_em TEXT,
    erro TEXT,
    UNIQUE (subscription_id, ciclo_cobranca),
    FOREIGN KEY (subscription_id) REFERENCES subscriptions (id)
  );

  CREATE INDEX IF NOT EXISTS idx_notification_deliveries_subscription
    ON notification_deliveries (subscription_id);
`);

export default db;
