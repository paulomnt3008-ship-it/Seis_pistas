import { prefersReducedMotion } from '../../js/core/motion.js';

const DURATION = 1200;
const DEFAULT_INDEX = 1;

const EASES = [
  { name: 'linear',        value: 'linear',                          points: [0, 0, 1, 1] },
  { name: 'ease-out expo', value: 'cubic-bezier(.16,1,.3,1)',        points: [.16, 1, .3, 1] },
  { name: 'anticipación',  value: 'cubic-bezier(.68,-0.6,.32,1.6)', points: [.68, -.6, .32, 1.6] },
  { name: 'ease-in-out',   value: 'cubic-bezier(.65,0,.35,1)',       points: [.65, 0, .35, 1] },
  { name: 'steps(6)',      value: 'steps(6, end)',                   steps: 6 }
];

// Coordenadas de la gráfica SVG: x de 0 a 100, y=0 abajo (170) e y=1 arriba (70)
const toX = (x) => x * 100;
const toY = (y) => 170 - y * 100;

/** Un eje de una curva de Bézier cúbica con extremos en 0 y 1. */
const bezier = (t, p1, p2) => {
  const u = 1 - t;
  return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t;
};

/** Valor de la curva para un tiempo t (0–1). */
function evaluate(ease, t) {
  if (ease.steps) return Math.floor(t * ease.steps) / ease.steps;
  const [x1, y1, x2, y2] = ease.points;
  let lo = 0, hi = 1, s = t;
  for (let i = 0; i < 20; i++) {           // bisección: hallar s tal que x(s) = t
    s = (lo + hi) / 2;
    if (bezier(s, x1, x2) < t) lo = s; else hi = s;
  }
  return bezier(s, y1, y2);
}

function pathFor(ease) {
  if (ease.steps) {
    let d = `M0 ${toY(0)}`;
    for (let i = 1; i <= ease.steps; i++) d += ` H${toX(i / ease.steps)} V${toY(i / ease.steps)}`;
    return d;
  }
  const [x1, y1, x2, y2] = ease.points;
  return `M0 ${toY(0)} C ${toX(x1)} ${toY(y1)}, ${toX(x2)} ${toY(y2)}, 100 ${toY(1)}`;
}

export function init(root) {
  const reduce = prefersReducedMotion();
  const buttons = root.querySelector('[data-ref="buttons"]');
  const lane = root.querySelector('[data-ref="lane"]');
  const ball = root.querySelector('[data-ref="ball"]');
  const code = root.querySelector('[data-ref="code"]');
  const curvePath = root.querySelector('[data-ref="curvePath"]');
  const curveDot = root.querySelector('[data-ref="curveDot"]');
  let dotRun = 0; // identifica la animación vigente del punto

  function moveDot(t, y) {
    curveDot.setAttribute('cx', toX(t));
    curveDot.setAttribute('cy', toY(y));
  }

  function select(ease, button) {
    [...buttons.children].forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    code.innerHTML = `transition-timing-function: <b>${ease.value}</b>`;
    curvePath.setAttribute('d', pathFor(ease));

    // La pelota: Web Animations API
    const distance = lane.clientWidth - ball.offsetWidth;
    ball.animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(${distance}px)` }],
      { duration: reduce ? 1 : DURATION, easing: ease.value, fill: 'forwards' }
    );

    // El punto sobre la gráfica sigue la misma curva
    if (reduce) { moveDot(1, 1); return; }
    const run = ++dotRun;
    const start = performance.now();
    const step = (now) => {
      if (run !== dotRun) return;
      const t = Math.min(1, (now - start) / DURATION);
      moveDot(t, evaluate(ease, t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  EASES.forEach((ease, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn';
    button.textContent = ease.name;
    button.addEventListener('click', () => select(ease, button));
    buttons.appendChild(button);
    if (i === DEFAULT_INDEX) setTimeout(() => select(ease, button), 300);
  });
}
