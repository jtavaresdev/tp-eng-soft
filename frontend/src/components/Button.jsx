import './Button.css';

/**
 * Botão padrão do SubFlow.
 *
 * variant: 'solid' | 'outline'
 * O componente não sabe se está sobre fundo azul ou claro — quem envolve
 * o botão define isso via a classe utilitária "on-blue" (ver index.css),
 * que ajusta as variáveis --btn-* usadas aqui.
 *
 * Exemplo:
 *   <div className="on-blue"><Button variant="solid">Abrir painel</Button></div>
 */
export default function Button({ variant = 'solid', as: Tag = 'button', className = '', children, ...props }) {
  return (
    <Tag className={`sf-btn sf-btn--${variant} ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}
