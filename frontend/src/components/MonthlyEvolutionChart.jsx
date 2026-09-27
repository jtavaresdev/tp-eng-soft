import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './MonthlyEvolutionChart.css';

const MESES_ABREVIADOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const formatoMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatarMes(mes) {
  const [ano, numeroMes] = mes.split('-');
  return `${MESES_ABREVIADOS[Number(numeroMes) - 1]}/${ano.slice(-2)}`;
}

export default function MonthlyEvolutionChart({ dados = [], carregando, erro }) {
  if (carregando) {
    return <p className="sf-monthly-chart__message">Carregando evolução mensal…</p>;
  }

  if (erro) {
    return <p className="sf-monthly-chart__message sf-monthly-chart__message--erro">{erro}</p>;
  }

  const semDados = dados.length === 0 || dados.every(({ total }) => total === 0);

  if (semDados) {
    return <p className="sf-monthly-chart__message">Ainda não há gastos mensais para exibir.</p>;
  }

  return (
    <div className="sf-monthly-chart" role="img" aria-label="Evolução mensal dos gastos">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={dados} margin={{ top: 12, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid stroke="var(--sf-line)" strokeDasharray="4 4" />
          <XAxis dataKey="mes" tickFormatter={formatarMes} stroke="var(--sf-muted)" />
          <YAxis tickFormatter={formatoMoeda.format} stroke="var(--sf-muted)" width={72} />
          <Tooltip
            labelFormatter={formatarMes}
            formatter={(valor) => [formatoMoeda.format(valor), 'Total mensal']}
            contentStyle={{
              background: 'var(--sf-paper)',
              border: '1px solid var(--sf-line)',
              borderRadius: 'var(--sf-radius-sm)',
              fontFamily: 'var(--sf-font-body)',
            }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="var(--sf-blue)"
            strokeWidth={2}
            dot={{ fill: 'var(--sf-blue)', r: 3 }}
            activeDot={{ fill: 'var(--sf-paper)', r: 5, stroke: 'var(--sf-blue)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
