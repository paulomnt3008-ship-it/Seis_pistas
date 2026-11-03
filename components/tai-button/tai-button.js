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

export function init(root) {
  const link = root.querySelector('[data-ref="button"]');

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
