import { prefersReducedMotion } from '../../js/core/motion.js';
import { hopPoses, poseFrame } from '../../js/core/draw.js';

const PHONE = 1100;

/** Fondo: una hoja de contactos de 40 cuadros con la pelota saltando. */
function buildGround(ground) {
  const poses = hopPoses(10);
  for (let row = 0; row < 4; row++) {
    poses.forEach((pose) => ground.appendChild(
      poseFrame(pose, { paper: '#3a3a3a', ink: '#5a5a5a', ball: '#f1f1ef', w: 100, h: 80 })
    ));
  }
}

/** La rejilla de la tarjeta de Anime.js: el retraso crece con la distancia al centro. */
function buildWave(wave) {
  const COLS = 12, ROWS = 6;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const dot = document.createElement('i');
      dot.style.setProperty('--d', Math.hypot(c - (COLS - 1) / 2, r - (ROWS - 1) / 2).toFixed(2));
      wave.appendChild(dot);
    }
  }
}

/**
 * La pista de tarjetas avanza de derecha a izquierda mientras la sección
 * está fija. El progreso vertical (0–1) se traduce a un desplazamiento horizontal;
 * el fondo se mueve más despacio, en sentido contrario.
 */
export function init(root) {
  const track = root.querySelector('[data-ref="track"]');
  const ground = root.querySelector('[data-ref="ground"]');
  buildGround(ground);
  buildWave(root.querySelector('[data-ref="wave"]'));
  if (prefersReducedMotion()) return;

  const cards = [...root.querySelectorAll('.card')];
  let travel = 0;
  let ticking = false;

  function measure() {
    travel = innerWidth <= PHONE ? 0 : Math.max(0, track.scrollWidth - innerWidth);
  }

  function update() {
    ticking = false;
    if (!travel) {
      track.style.transform = '';
      ground.style.transform = '';
      cards.forEach((card) => { card.style.opacity = ''; card.style.transform = ''; });
      return;
    }
    const r = root.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    track.style.transform = `translate3d(${-p * travel}px, 0, 0)`;
    ground.style.transform = `translate3d(${-p * innerWidth * .12}px, ${(p - .5) * -40}px, 0) rotate(-4deg)`;

    // Cada tarjeta aparece y se endereza al entrar por la derecha
    cards.forEach((card) => {
      const left = card.getBoundingClientRect().left;
      const k = Math.min(1, Math.max(0, (innerWidth - left - 120) / (innerWidth * .3)));
      card.style.opacity = String(k);
      card.style.transform = `translateY(${(1 - k) * 60}px) rotate(${(1 - k) * 5}deg)`;
    });
  }

  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', () => { measure(); update(); });
  new ResizeObserver(() => { measure(); update(); }).observe(track);
  measure();
  update();
}
