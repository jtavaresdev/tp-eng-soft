import { useCallback, useEffect, useState } from 'react';
import Nav from '../components/Nav.jsx';
import SubscriptionForm from '../components/SubscriptionForm.jsx';
import { listSubscriptions, createSubscription } from '../services/api.js';
import './Painel.css';

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Painel() {
  const [assinaturas, setAssinaturas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState(null);

  const carregarAssinaturas = useCallback(() => {
    setCarregando(true);
    setErroLista(null);
    listSubscriptions('ativo')
      .then(setAssinaturas)
      .catch((err) => setErroLista(err.message))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregarAssinaturas();
  }, [carregarAssinaturas]);

  async function handleCriar(dados) {
    await createSubscription(dados);
    carregarAssinaturas();
  }

  return (
    <div className="sf-painel">
      <Nav tone="on-light" showCta={false} />

      <main className="sf-painel__content">
        <section className="sf-painel__card">
          <h1>Nova assinatura</h1>
          <SubscriptionForm onSubmit={handleCriar} />
        </section>

        <section className="sf-painel__card">
          <h2>Assinaturas ativas</h2>

          {carregando && <p className="sf-painel__aviso">Carregando…</p>}
          {erroLista && <p className="sf-painel__erro">{erroLista}</p>}
          {!carregando && !erroLista && assinaturas.length === 0 && (
            <p className="sf-painel__aviso">Nenhuma assinatura cadastrada ainda.</p>
          )}

          <ul className="sf-painel__lista">
            {assinaturas.map((assinatura) => (
              <li key={assinatura.id} className="sf-painel__item">
                <span className="sf-painel__item-nome">{assinatura.nome}</span>
                <span className="sf-painel__item-valor">{formatoMoeda.format(assinatura.valor)}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
