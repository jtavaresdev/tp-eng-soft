import './Badge.css';

/**
 * Selo de status de uma assinatura.
 * tone: 'ativo' | 'cancelado' | 'alerta' (renovação próxima)
 */
export default function Badge({ tone = 'ativo', children }) {
  return <span className={`sf-badge sf-badge--${tone}`}>{children}</span>;
}
