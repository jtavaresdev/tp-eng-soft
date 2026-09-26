import { Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Button from '../components/Button.jsx';
import heroImage from '../assets/hero.jpg';
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
      <Nav tone="on-blue" ctaTo="/painel" ctaLabel="Abrir painel" />

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
            <Button as={Link} to="/painel" variant="solid">
              Abrir painel
            </Button>
            <Button as="a" href="#docs" variant="outline">
              Ver documentação
            </Button>
          </div>
        </div>

        <div className="sf-hero__graphic">
          <img src={heroImage} alt="Ilustração do SubFlow" className="sf-hero__image" />
        </div>
      </main>

      <div className="sf-status" role="status">
        <span className={`sf-status__dot sf-status__dot--${status}`} />
        {HEALTH_LABEL[status]}
      </div>
    </div>
  );
}
