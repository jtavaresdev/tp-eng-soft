import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import subscriptionsRouter from './routes/subscriptions.js';
import statsRouter from './routes/stats.js';
import notificationsRouter from './routes/notifications.js';
import { iniciarAgendamentoNotificacoes } from './services/notificationService.js';

const app = express();

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.use('/health', healthRouter);
app.use('/subscriptions', subscriptionsRouter);
app.use('/stats', statsRouter);
app.use('/notifications', notificationsRouter);

// Colocar rotas aqui
app.use('/subscriptions', subscriptionsRouter);

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros (formato de erro padrão: { error: "mensagem" })
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

iniciarAgendamentoNotificacoes();

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
