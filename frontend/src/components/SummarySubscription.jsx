import StatCard from './StatCard.jsx';
import './SummarySubscription.css';

/**
 * Barra de resumo no topo do painel (US3): total mensal (formatado em
 * Real) e quantidade de assinaturas ativas, ambos calculados pelo
 * backend em GET /api/subscriptions/summary.
 *
 * ATENÇÃO: assumi que `StatCard` aceita as props `label` e `value`
 * (mesmo padrão de nomenclatura em inglês usado em `Button`/`Badge` —
 * variant/tone). Ajuste os nomes abaixo se a assinatura real do
 * componente for diferente (ex: `titulo`/`valor`).
 */
export default function SummarySubscription({ resumo, carregando, erro, formatoMoeda }) {
  if (erro) {
    return (
      <div className="sf-resumo sf-resumo--erro" role="alert">
        Não foi possível carregar o resumo: {erro}
      </div>
    );
  }

  return (
    <section className="sf-resumo" aria-busy={carregando} aria-live="polite">
      <StatCard
        label="Total mensal"
        value={carregando ? '—' : formatoMoeda.format(resumo.totalMensal)}
      />
      <StatCard
        label="Assinaturas ativas"
        value={carregando ? '—' : String(resumo.quantidadeAtivas)}
      />
    </section>
  );
}