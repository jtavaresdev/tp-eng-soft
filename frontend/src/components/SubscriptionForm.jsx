import { useEffect, useState } from 'react';
import Button from './Button.jsx';
import './SubscriptionForm.css';

const CATEGORIAS = [
  { value: 'streaming', label: 'Streaming' },
  { value: 'produtividade', label: 'Produtividade' },
  { value: 'jogos', label: 'Jogos' },
  { value: 'academia', label: 'Academia' },
  { value: 'outros', label: 'Outros' },
];

const CAMPOS_VAZIOS = {
  nome: '',
  valor: '',
  data_cobranca: '',
  data_inicio: '',
  categoria: '',
};

function formatarDataParaInput(data) {
  return data ? String(data).slice(0, 10) : '';
}

function normalizarCampos(dados) {
  if (!dados) {
    return CAMPOS_VAZIOS;
  }

  return {
    nome: dados.nome ?? '',
    valor: dados.valor != null ? String(dados.valor) : '',
    data_cobranca: dados.data_cobranca ?? '',
    data_inicio: formatarDataParaInput(dados.data_inicio ?? dados.criado_em),
    categoria: dados.categoria ?? '',
  };
}

export default function SubscriptionForm({
  onSubmit,
  initialValues = null,
  submitLabel = 'Cadastrar assinatura',
  onCancel = null,
}) {
  const [campos, setCampos] = useState(() => normalizarCampos(initialValues));
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setCampos(normalizarCampos(initialValues));
  }, [initialValues]);

  function atualizarCampo(evento) {
    const { name, value } = evento.target;
    setCampos((atual) => ({ ...atual, [name]: value }));
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      await onSubmit({
        nome: campos.nome,
        valor: Number(campos.valor),
        data_cobranca: campos.data_cobranca,
        data_inicio: campos.data_inicio,
        categoria: campos.categoria,
      });
      setCampos(CAMPOS_VAZIOS);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="sf-form" onSubmit={handleSubmit}>
      <div className="sf-form__row">
        <label htmlFor="nome">Nome</label>
        <input
          id="nome"
          name="nome"
          type="text"
          placeholder="Netflix"
          value={campos.nome}
          onChange={atualizarCampo}
          required
        />
      </div>

      <div className="sf-form__row">
        <label htmlFor="valor">Valor (R$)</label>
        <input
          id="valor"
          name="valor"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="39.90"
          value={campos.valor}
          onChange={atualizarCampo}
          required
        />
      </div>

      <div className="sf-form__row">
        <label htmlFor="data_cobranca">Data de cobrança</label>
        <input
          id="data_cobranca"
          name="data_cobranca"
          type="date"
          value={campos.data_cobranca}
          onChange={atualizarCampo}
          required
        />
      </div>

      <div className="sf-form__row">
        <label htmlFor="data_inicio">Data de início</label>
        <input
          id="data_inicio"
          name="data_inicio"
          type="date"
          value={campos.data_inicio}
          onChange={atualizarCampo}
          required
        />
      </div>

      <div className="sf-form__row">
        <label htmlFor="categoria">Categoria</label>
        <select id="categoria" name="categoria" value={campos.categoria} onChange={atualizarCampo} required>
          <option value="" disabled>
            Selecione...
          </option>
          {CATEGORIAS.map((categoria) => (
            <option key={categoria.value} value={categoria.value}>
              {categoria.label}
            </option>
          ))}
        </select>
      </div>

      {erro && (
        <p className="sf-form__erro" role="alert">
          {erro}
        </p>
      )}

      <div className="sf-form__actions">
        <Button type="submit" variant="solid" disabled={enviando}>
          {enviando ? 'Salvando…' : submitLabel}
        </Button>

        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
