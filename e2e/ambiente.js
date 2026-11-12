// Portas próprias dos testes E2E, diferentes das de desenvolvimento
// (3001 / 5173), para não conflitar com um `npm run dev` aberto.
export const PORTA_API = 3101;
export const PORTA_WEB = 5174;

export const URL_API = `http://localhost:${PORTA_API}`;
export const URL_WEB = `http://localhost:${PORTA_WEB}`;
