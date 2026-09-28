import { API_BASE_URL, grupos } from '../../data/apiDocs.js';
import './Docs.css';

const CURL_HEALTH = `curl ${API_BASE_URL}/health`;

const CURL_CRIAR = `curl -X POST ${API_BASE_URL}/subscriptions \\
  -H "Content-Type: application/json" \\
  -d '{"nome":"Netflix","valor":39.90,"data_cobranca":"2026-10-05","data_inicio":"2026-01-05","categoria":"streaming"}'`;

const COLUNAS_PARAMS = [
  { chave: 'nome', titulo: 'Nome' },
  { chave: 'onde', titulo: 'Onde' },
  { chave: 'descricao', titulo: 'Descrição' },
];

const COLUNAS_CAMPOS = [
  { chave: 'nome', titulo: 'Campo' },
  { chave: 'tipo', titulo: 'Tipo' },
  { chave: 'descricao', titulo: 'Descrição' },
];

function CodeBlock({ children }) {
  return (
    <pre className="sf-docs__code">
      <code>{children}</code>
    </pre>
  );
}

function Tabela({ colunas, linhas }) {
  return (
    <div className="sf-docs__table-wrap">
      <table className="sf-docs__table">
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna.chave}>{coluna.titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.nome}>
              {colunas.map((coluna) => (
                <td key={coluna.chave}>
                  {coluna.chave === 'nome' ? <code>{linha.nome}</code> : linha[coluna.chave]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function classeStatus(status) {
  if (status >= 500) return 'sf-docs__status--server';
  if (status >= 400) return 'sf-docs__status--client';
  return 'sf-docs__status--ok';
}

function Endpoint({ endpoint }) {
  const { metodo, caminho, alias, resumo, params, campos, corpo, respostas } = endpoint;

  return (
    <article className="sf-docs__endpoint">
      <h4 className="sf-docs__route">
        <span className={`sf-docs__method sf-docs__method--${metodo.toLowerCase()}`}>{metodo}</span>
        <code>{caminho}</code>
      </h4>

      {alias && (
        <p className="sf-docs__alias">
          Também disponível como <code>{alias}</code>
        </p>
      )}

      <p className="sf-docs__text">{resumo}</p>

      {params && (
        <>
          <p className="sf-docs__label">Parâmetros</p>
          <Tabela colunas={COLUNAS_PARAMS} linhas={params} />
        </>
      )}

      {campos && (
        <>
          <p className="sf-docs__label">Corpo da requisição (JSON)</p>
          <Tabela colunas={COLUNAS_CAMPOS} linhas={campos} />
          <CodeBlock>{corpo}</CodeBlock>
        </>
      )}

      <p className="sf-docs__label">Respostas</p>
      {respostas.map((resposta) => (
        <div key={resposta.status} className="sf-docs__response">
          <p className="sf-docs__response-head">
            <span className={`sf-docs__status ${classeStatus(resposta.status)}`}>{resposta.status}</span>
            {resposta.descricao}
          </p>
          {resposta.exemplo && <CodeBlock>{resposta.exemplo}</CodeBlock>}
        </div>
      ))}
    </article>
  );
}

export default function Docs() {
  return (
    <section id="docs" className="sf-docs">
      <div className="sf-docs__inner">
        <aside className="sf-docs__sidebar">
          <p className="sf-docs__sidebar-title">Documentação</p>
          <nav>
            <a href="#doc-comecando">Começando</a>
            {grupos.map((grupo) => (
              <a key={grupo.id} href={`#doc-${grupo.id}`}>
                {grupo.titulo}
              </a>
            ))}
          </nav>
        </aside>

        <div className="sf-docs__content">
          <header className="sf-docs__header">
            <p className="sf-docs__kicker">API v0.1</p>
            <h2 className="sf-docs__title">Documentação</h2>
            <p className="sf-docs__lead">
              Referência das rotas do backend do SubFlow: o que cada uma recebe, o que devolve e
              quais erros podem acontecer.
            </p>
          </header>

          <section id="doc-comecando" className="sf-docs__group">
            <h3>Começando</h3>
            <p className="sf-docs__group-desc">
              A API responde sempre em JSON e não exige autenticação (uso individual). Em
              desenvolvimento, a URL base é:
            </p>
            <CodeBlock>{API_BASE_URL}</CodeBlock>

            <p className="sf-docs__label">Formato de erro</p>
            <p className="sf-docs__text">
              Erros de validação (400) e de recurso inexistente (404) vêm sempre neste formato:
            </p>
            <CodeBlock>{`{ "error": "Mensagem descrevendo o problema" }`}</CodeBlock>

            <p className="sf-docs__label">Teste rápido</p>
            <p className="sf-docs__text">Com o projeto rodando (npm run dev), confira se a API está no ar:</p>
            <CodeBlock>{CURL_HEALTH}</CodeBlock>
            <p className="sf-docs__text">E cadastre uma assinatura:</p>
            <CodeBlock>{CURL_CRIAR}</CodeBlock>
          </section>

          {grupos.map((grupo) => (
            <section key={grupo.id} id={`doc-${grupo.id}`} className="sf-docs__group">
              <h3>{grupo.titulo}</h3>
              <p className="sf-docs__group-desc">{grupo.descricao}</p>
              {grupo.endpoints.map((endpoint) => (
                <Endpoint key={`${endpoint.metodo}-${endpoint.caminho}`} endpoint={endpoint} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
