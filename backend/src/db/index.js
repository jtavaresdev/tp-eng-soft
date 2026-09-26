// Este arquivo tem UM trabalho: abrir (ou criar) o banco SQLite e
// garantir que a tabela "subscriptions" existe. Todo o resto do
// backend importa o "db" daqui — nunca abrimos o banco em outro lugar.

import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dbPath = process.env.DB_PATH;

fs.mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    valor REAL NOT NULL,
    data_cobranca TEXT NOT NULL,
    categoria TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ativo',
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    cancelado_em TEXT
  );
`);

export default db;
