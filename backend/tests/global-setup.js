import fs from 'node:fs';
import path from 'node:path';

// Roda uma vez antes/depois de toda a suíte: zera a pasta dos bancos de teste.
const PASTA_BANCOS = path.resolve('data/test');

export function setup() {
  fs.rmSync(PASTA_BANCOS, { recursive: true, force: true });
  fs.mkdirSync(PASTA_BANCOS, { recursive: true });
}

export function teardown() {
  fs.rmSync(PASTA_BANCOS, { recursive: true, force: true });
}
