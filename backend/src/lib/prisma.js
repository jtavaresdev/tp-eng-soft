import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Singleton para evitar múltiplas conexões abertas com o SQLite
// (especialmente relevante com hot-reload em dev).
const adapter = new PrismaBetterSqlite3({
    url: process.env.DB_PATH ?? 'file:./data/dev.db',
});

export const prisma = new PrismaClient({ adapter });
