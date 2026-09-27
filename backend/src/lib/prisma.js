import pkg from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const { PrismaClient } = pkg;

// Singleton para evitar múltiplas conexões abertas com o SQLite
// (especialmente relevante com hot-reload em dev).
const adapter = new PrismaBetterSqlite3({
  url: process.env.DB_PATH,
});

export const prisma = new PrismaClient({ adapter });
