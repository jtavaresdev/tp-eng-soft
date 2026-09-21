import useHealth from '../hooks/useHealth.js';

const MENSAGENS = {
  loading: 'Verificando conexão com a API...',
  ok: 'API conectada.',
  error: 'Não foi possível conectar à API. Verifique se o backend está rodando.',
};

export default function Home() {
  const status = useHealth();

  return (
    <main className="home">
      <h1>Gerenciador de Assinaturas</h1>
      <p className="home__subtitle">Acompanhe tudo o que você paga por mês em um só lugar.</p>
      <p className={`home__status home__status--${status}`} role="status">
        {MENSAGENS[status]}
      </p>
    </main>
  );
}
