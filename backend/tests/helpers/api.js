import request from 'supertest';
import app from '../../src/app.js';

// Cliente HTTP dos testes de integração. Fala direto com o app Express,
// sem abrir porta. Uso: `await api.get('/health')`.
export const api = request(app);
