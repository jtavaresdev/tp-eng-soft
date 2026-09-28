import { Link } from 'react-router-dom';
import Button from './Button.jsx';
import './Nav.css';

/**
 * Barra de navegação compartilhada entre Home e Painel.
 * tone: 'on-blue' (hero) | 'on-light' (telas internas)
 * showCta: esconde o botão "Abrir painel" quando já estamos dentro dele.
 */
export default function Nav({ tone = 'on-light', showCta = true, ctaTo = '/painel', ctaLabel = 'Abrir painel' }) {
  return (
    <header className={`sf-nav ${tone}`}>
      <nav className="sf-nav__side">
        <Link to="/">Início</Link>
        <Link to="/#docs">Docs</Link>
      </nav>

      <Link to="/" className="sf-nav__logo">
        SubFlow
      </Link>

      <nav className="sf-nav__side sf-nav__side--right">
        <a href="https://github.com/jtavaresdev/tp-eng-soft" target="_blank" rel="noreferrer">
          GitHub
        </a>
        {showCta && (
          <Button as={Link} to={ctaTo} variant="solid">
            {ctaLabel}
          </Button>
        )}
      </nav>
    </header>
  );
}
