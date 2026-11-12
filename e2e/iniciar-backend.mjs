// Sobe a API para os testes E2E com um banco SQLite novo a cada execução.
// É chamado pelo Playwright (ver playwright.config.js) a partir da pasta
// backend/, com as variáveis de ambiente de teste já definidas.
import fs from 'node:fs';
import path from 'node:path';

const arquivoBanco = path.resolve(process.env.DB_PATH.replace(/^file:/, ''));

for (const sufixo of ['', '-shm', '-wal']) {
  fs.rmSync(arquivoBanco + sufixo, { force: true });
}

await import('../backend/src/server.js');
