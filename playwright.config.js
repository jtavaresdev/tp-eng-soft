import { defineConfig, devices } from '@playwright/test';
import { PORTA_API, PORTA_WEB, URL_API, URL_WEB } from './e2e/ambiente.js';

// Testes end-to-end: o Playwright sobe a API (banco próprio, e-mail em
// dry-run) e o frontend, e dirige um navegador de verdade.
export default defineConfig({
  testDir: './e2e',
  // Todos os testes usam o mesmo banco, então rodam um de cada vez.
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: URL_WEB,
    locale: 'pt-BR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node ../e2e/iniciar-backend.mjs',
      cwd: 'backend',
      url: `${URL_API}/health`,
      reuseExistingServer: false,
      env: {
        PORT: String(PORTA_API),
        NODE_ENV: 'test',
        CORS_ORIGIN: URL_WEB,
        DB_PATH: 'file:./data/e2e.db',
        DATABASE_URL: '',
        NOTIFICATION_SCHEDULER_ENABLED: 'false',
        NOTIFY_DRY_RUN: 'true',
        NOTIFY_EMAIL_TO: 'teste@exemplo.com',
        SMTP_HOST: 'smtp.invalid',
      },
    },
    {
      command: `npx vite --port ${PORTA_WEB} --strictPort`,
      cwd: 'frontend',
      url: URL_WEB,
      reuseExistingServer: false,
      env: { VITE_API_URL: URL_API },
    },
  ],
});
