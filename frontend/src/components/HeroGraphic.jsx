/**
 * Ilustração original do hero: um diagrama radial (hub-and-spoke).
 * Não é decoração — representa literalmente o produto: cada linha é
 * uma assinatura diferente, e todas convergem para um único ponto (o painel).
 */
export default function HeroGraphic() {
  const spokes = 14;
  const center = 300;
  const rInner = 46;
  const rOuter = 260;

  const lines = Array.from({ length: spokes }).map((_, i) => {
    const angle = (i / spokes) * Math.PI * 2;
    const x1 = center + Math.cos(angle) * rInner;
    const y1 = center + Math.sin(angle) * rInner;
    const x2 = center + Math.cos(angle) * rOuter;
    const y2 = center + Math.sin(angle) * rOuter;
    return { x1, y1, x2, y2, x2b: center + Math.cos(angle) * (rOuter + 14), y2b: center + Math.sin(angle) * (rOuter + 14) };
  });

  return (
    <svg viewBox="0 0 600 600" role="img" aria-label="Diagrama radial representando assinaturas conectadas a um painel central">
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.5"
        />
      ))}
      {lines.map((l, i) => (
        <circle key={`node-${i}`} cx={l.x2b} cy={l.y2b} r="4" fill="#ffffff" />
      ))}
      <circle cx={center} cy={center} r={rInner} fill="none" stroke="#ffffff" strokeWidth="2" />
      <circle cx={center} cy={center} r={rInner - 14} fill="#ffffff" opacity="0.12" />
    </svg>
  );
}
