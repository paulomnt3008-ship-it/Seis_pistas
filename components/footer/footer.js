/* Cierre: la cuenta regresiva en SVG y el botón "Solo para Tai" con su telón de corazón */
import { prefersReducedMotion } from '../../js/core/motion.js';

const HEART_PATH = 'M50 86 C20 64 2 46 2 28 C2 12 14 2 28 2 C38 2 46 8 50 16 C54 8 62 2 72 2 C86 2 98 12 98 28 C98 46 80 64 50 86 Z';
const SPARKS = 12;
const IRIS_MS = 1000;

const heartSvg = (className) =>
  `<svg class="${className}" viewBox="0 0 100 90" aria-hidden="true"><path d="${HEART_PATH}"/></svg>`;

/** Lanza corazones pequeños desde (x, y) en todas direcciones. */
function burst(x, y) {
  for (let i = 0; i < SPARKS; i++) {
    const holder = document.createElement('div');
    holder.innerHTML = heartSvg('love-spark');
    const spark = holder.firstElementChild;
    spark.style.left = `${x - 7}px`;
    spark.style.top = `${y - 6}px`;
    document.body.appendChild(spark);

    const angle = (i / SPARKS) * Math.PI * 2 + Math.random() * .4;
    const distance = 60 + Math.random() * 70;
    spark.animate([
      { transform: 'translate(0, 0) scale(.4)', opacity: 1 },
      { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance - 30}px) scale(1.1) rotate(${(Math.random() - .5) * 60}deg)`, opacity: 0 }
    ], { duration: 900, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' })
      .finished.then(() => spark.remove());
  }
}

/** Telón circular que se abre desde (x, y) y cubre la pantalla. */
function irisFrom(x, y) {
  const overlay = document.createElement('div');
  overlay.className = 'love-iris';
  overlay.innerHTML = `<svg viewBox="0 0 100 90" aria-hidden="true"><path d="${HEART_PATH}"/></svg>`;
  document.body.appendChild(overlay);

  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  overlay.animate(
    [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${radius}px at ${x}px ${y}px)` }],
    { duration: IRIS_MS, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }
  );
  overlay.querySelector('svg').animate(
    [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }],
    { duration: 500, delay: IRIS_MS - 350, easing: 'ease-out', fill: 'forwards' }
  );
  return new Promise((resolve) => setTimeout(resolve, IRIS_MS + 200));
}

/**
 * Cuenta regresiva de película en SVG: dos círculos, una cruz, un sector que
 * barre la pantalla en un segundo y el número que baja de 8 a 2.
 */
function buildLeader(box, reduce) {
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  };
  const svg = make('svg', { viewBox: '0 0 400 300', 'aria-hidden': 'true' });
  svg.append(
    make('rect', { width: 400, height: 300, fill: '#3a3a3a' }),
    make('rect', { x: 0, y: 147, width: 400, height: 6, fill: '#1c1c1c' }),
    make('rect', { x: 197, y: 0, width: 6, height: 300, fill: '#1c1c1c' })
  );
  // El sector que barre: un círculo con trazo tan ancho como su radio
  const C = 2 * Math.PI * 70;
  const sweep = make('circle', {
    cx: 200, cy: 150, r: 70, fill: 'none', stroke: '#f1f1ef', 'stroke-opacity': .28,
    'stroke-width': 140, 'stroke-dasharray': C, 'stroke-dashoffset': C,
    transform: 'rotate(-90 200 150)'
  });
  const num = make('text', { x: 200, y: 150, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'leader__num' });
  num.textContent = '8';
  svg.append(
    sweep,
    make('circle', { cx: 200, cy: 150, r: 128, fill: 'none', stroke: '#f1f1ef', 'stroke-width': 8 }),
    make('circle', { cx: 200, cy: 150, r: 104, fill: 'none', stroke: '#f1f1ef', 'stroke-width': 8 }),
    num
  );
  box.appendChild(svg);
  if (reduce) return;

  const anim = sweep.animate(
    [{ strokeDashoffset: C }, { strokeDashoffset: 0 }],
    { duration: 1000, iterations: Infinity, easing: 'linear' }
  );
  // El número cambia en cada vuelta del sector: 8, 7, … 2 y vuelve a empezar
  const tick = () => {
    const second = Math.floor((anim.currentTime ?? 0) / 1000);
    num.textContent = String(8 - (second % 7));
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function init(root) {
  const link = root.querySelector('[data-ref="taiButton"]');
  buildLeader(root.querySelector('[data-ref="leader"]'), prefersReducedMotion());

  link.addEventListener('click', async (event) => {
    // Respetar Ctrl/Cmd + clic para abrir en otra pestaña
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    if (prefersReducedMotion()) return; // navega normal, sin animación

    event.preventDefault();
    const r = link.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;

    burst(x, y);
    await irisFrom(x, y);
    window.location.href = link.href;
  });

  // Al volver con el botón "atrás", quitar el telón si la página quedó en caché
  addEventListener('pageshow', (event) => {
    if (event.persisted) document.querySelectorAll('.love-iris, .love-spark').forEach((el) => el.remove());
  });
}
