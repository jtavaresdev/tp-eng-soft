import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    globalSetup: ['./tests/global-setup.js'],
    setupFiles: ['./tests/setup.js'],
    restoreMocks: true,
    unstubEnvs: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      // server.js só sobe a porta e o agendador; é exercitado pelos testes E2E.
      exclude: ['src/server.js'],
      reporter: ['text', 'html'],
      // Requisito do trabalho: cobertura mínima de 80%.
      // `npm run test:coverage` falha enquanto estiver abaixo disso.
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
      },
    },
  },
});
