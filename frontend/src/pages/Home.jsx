import Button from '../components/Button.jsx';
import HeroGraphic from '../components/HeroGraphic.jsx';
import useHealth from '../hooks/useHealth.js';
import './Home.css';

const HEALTH_LABEL = {
  loading: 'Verificando…',
  ok: 'API conectada',
  error: 'API offline',
};

export default function Home() {
  const status = useHealth();

  return (
    <div className="sf-page">
      <header className="sf-nav on-blue">
        <nav className="sf-nav__side">
          <a href="#sobre">Sobre</a>
          <a href="#docs">Docs</a>
        </nav>

        <span className="sf-nav__logo">SubFlow</span>

        <nav className="sf-nav__side sf-nav__side--right">
          <a href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <Button as="a" href="#painel" variant="solid">
            Abrir painel
          </Button>
        </nav>
      </header>

      <main className="sf-hero on-blue">
        <div className="sf-hero__text">
          <h1 className="sf-hero__title">
            Saiba sempre
            <br />
            com o que você
            <br />
            está gastando.
          </h1>
          <p className="sf-hero__subtitle">
            O SubFlow reúne todas as suas assinaturas em um só painel e avisa
            antes de cada cobrança, para nada te pegar de surpresa.
          </p>
          <div className="sf-hero__actions">
            <Button as="a" href="#painel" variant="solid">
              Abrir painel
            </Button>
            <Button as="a" href="#docs" variant="outline">
              Ver documentação
            </Button>
          </div>
        </div>

        <div className="sf-hero__graphic" aria-hidden="true">
          <HeroGraphic />
        </div>
      </main>

      <div className="sf-status" role="status">
        <span className={`sf-status__dot sf-status__dot--${status}`} />
        {HEALTH_LABEL[status]}
      </div>
    </div>
  );
}
