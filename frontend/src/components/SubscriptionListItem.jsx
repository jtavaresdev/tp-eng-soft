import { useEffect, useRef, useState } from 'react';
import Button from './Button.jsx';
import './SubscriptionListItem.css';

const TEMPO_CONFIRMACAO = 3000; //

/**
 * Um item da lista de assinaturas, com o botão de remover (US6).
 * Confirmação inline: primeiro clique vira "Confirmar?"; segundo clique
 * (dentro de TEMPO_CONFIRMACAO) remove de verdade. Evita usar o
 * window.confirm() nativo do navegador, que quebraria o visual do SubFlow.
 */
export default function SubscriptionListItem({ assinatura, formatoMoeda, onRemover, onEditar }) {
  const [confirmando, setConfirmando] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function handleClick() {
    if (!confirmando) {
      setConfirmando(true);
      timerRef.current = setTimeout(() => setConfirmando(false), TEMPO_CONFIRMACAO);
      return;
    }

    clearTimeout(timerRef.current);
    setRemovendo(true);
    onRemover(assinatura.id).finally(() => {
      setRemovendo(false);
      setConfirmando(false);
    });
  }

  return (
    <li className="sf-painel__item">
      <span className="sf-painel__item-nome">{assinatura.nome}</span>
      <span className="sf-painel__item-valor">{formatoMoeda.format(assinatura.valor)}</span>
      {onEditar && (
        <Button
          type="button"
          variant="outline"
          onClick={() => onEditar(assinatura)}
          aria-label={`Editar ${assinatura.nome}`}
        >
          Editar
        </Button>
      )}
      <button
        type="button"
        className={`sf-remove-btn ${confirmando ? 'sf-remove-btn--confirmando' : ''}`}
        onClick={handleClick}
        disabled={removendo}
      >
        {removendo ? 'Removendo…' : confirmando ? 'Confirmar?' : 'Remover'}
      </button>
    </li>
  );
}
