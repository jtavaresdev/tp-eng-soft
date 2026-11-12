import app from './app.js';
import { iniciarAgendamentoNotificacoes } from './services/notificationService.js';

const PORT = process.env.PORT || 3001;

iniciarAgendamentoNotificacoes();

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
