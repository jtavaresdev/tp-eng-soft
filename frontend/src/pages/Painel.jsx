import { useCallback, useEffect, useState } from 'react';
import Nav from '../components/Nav.jsx';
import Button from '../components/Button.jsx';
import SubscriptionForm from '../components/SubscriptionForm.jsx';
import { listSubscriptions, createSubscription, updateSubscription, deleteSubscription } from '../services/api.js';
import SubscriptionListItem from '../components/SubscriptionListItem.jsx';
import './Painel.css';

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Painel() {
  const [assinaturas, setAssinaturas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState(null);
  const [assinaturaEmEdicao, setAssinaturaEmEdicao] = useState(null);

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

  async function handleSalvar(dados) {
    if (!assinaturaEmEdicao) {
      return handleCriar(dados);
    }

    const atualizada = await updateSubscription(assinaturaEmEdicao.id, dados);
    setAssinaturas((atuais) =>
      atuais
        .map((assinatura) => (assinatura.id === atualizada.id ? atualizada : assinatura))
        .sort((a, b) => a.data_cobranca.localeCompare(b.data_cobranca)),
    );
    setAssinaturaEmEdicao(null);
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
        <section className="sf-painel__card">
          <h1>{assinaturaEmEdicao ? 'Editar assinatura' : 'Nova assinatura'}</h1>
          <SubscriptionForm
            onSubmit={handleSalvar}
            initialValues={assinaturaEmEdicao}
            submitLabel={assinaturaEmEdicao ? 'Salvar alterações' : 'Cadastrar assinatura'}
            onCancel={assinaturaEmEdicao ? () => setAssinaturaEmEdicao(null) : undefined}
          />
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
                onEditar={() => setAssinaturaEmEdicao(assinatura)}

              />
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
