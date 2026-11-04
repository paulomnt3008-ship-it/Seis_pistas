import { prefersReducedMotion } from '../../js/core/motion.js';

const ROWS = 9;
const CELL = 30;
const MIN_COLS = 8;
const MAX_COLS = 22;

export function init(root) {
  if (!window.anime) return;

  const reduce = prefersReducedMotion();
  const grid = root.querySelector('[data-ref="grid"]');
  const path = root.querySelector('[data-ref="path"]');
  let cols = 0;

  const dots = () => grid.children;

  function drawLine() {
    anime({
      targets: path,
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: reduce ? 1 : 1400,
      easing: 'easeInOutSine'
    });
  }

  function wave(from) {
    anime.remove(dots());
    anime({
      targets: dots(),
      scale: [
        { value: .2, easing: 'easeOutSine', duration: 250 },
        { value: 1, easing: 'easeInOutQuad', duration: 600 }
      ],
      translateY: [
        { value: -12, easing: 'easeOutSine', duration: 250 },
        { value: 0, easing: 'easeOutElastic(1,.5)', duration: 900 }
      ],
      delay: anime.stagger(45, { grid: [cols, ROWS], from })
    });
    drawLine();
  }

  /** Reconstruye la rejilla solo si cambia el número de columnas. */
  function build() {
    const available = grid.parentElement.clientWidth - 40;
    const next = Math.max(MIN_COLS, Math.min(MAX_COLS, Math.floor(available / CELL)));
    if (next === cols) return;

    cols = next;
    grid.style.setProperty('--cols', cols);
    grid.replaceChildren();
    for (let i = 0; i < cols * ROWS; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'ripple__dot';
      dot.setAttribute('aria-label', `Onda desde el punto ${i + 1}`);
      dot.addEventListener('click', () => wave(i));
      grid.appendChild(dot);
    }
  }

  build();
  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  });

  // Primera onda cuando la pista entra en pantalla
  if (!reduce) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      wave(Math.floor(cols * ROWS / 2));
      observer.disconnect();
    }, { threshold: .4 });
    observer.observe(grid);
  }
}
