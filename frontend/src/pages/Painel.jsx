import { useCallback, useEffect, useState } from 'react';
import Nav from '../components/Nav.jsx';
import SummarySubscription from '../components/SummarySubscription.jsx';
import SubscriptionForm from '../components/SubscriptionForm.jsx';
import SubscriptionListItem from '../components/SubscriptionListItem.jsx';
import { useSubscriptionSummary } from '../hooks/useSummary.js';
import { listSubscriptions, createSubscription, deleteSubscription } from '../services/api.js';
import './Painel.css';

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Painel() {
  const [assinaturas, setAssinaturas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState(null);

  const { resumo, carregando: carregandoResumo, erro: erroResumo, recarregarResumo } =
  useSubscriptionSummary();

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

  const atualizarListaEResumo = useCallback(() => {
    return Promise.all([carregarAssinaturas(), recarregarResumo()]);
  }, [carregarAssinaturas, recarregarResumo]);

  async function handleCriar(dados) {
    await createSubscription(dados);
    carregarAssinaturas();
  }

  async function handleRemover(id) {
    try {
      await deleteSubscription(id);
      await carregarAssinaturas();
    } catch (err) {
      setErroLista(err.message);
    }
  }

  return (
    <div className="sf-painel">
      <Nav tone="on-light" showCta={false} />

      <main className="sf-painel__content">
        <SummarySubscription
          resumo={resumo}
          carregando={carregandoResumo}
          erro={erroResumo}
          formatoMoeda={formatoMoeda}
        />
 
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
              <SubscriptionListItem
                key={assinatura.id}
                assinatura={assinatura}
                formatoMoeda={formatoMoeda}
                onRemover={handleRemover}
                onAtualizado={atualizarListaEResumo}
              />
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
