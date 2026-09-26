import './StatCard.css';

/**
 * Card de número em destaque (ex.: total mensal, US3).
 * Usa a fonte de display para dar peso ao número, igual a um extrato.
 */
export default function StatCard({ label, value, hint }) {
  return (
    <div className="sf-stat">
      <span className="sf-stat__label">{label}</span>
      <span className="sf-stat__value">{value}</span>
      {hint && <span className="sf-stat__hint">{hint}</span>}
    </div>
  );
}
