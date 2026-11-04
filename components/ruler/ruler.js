import { pad, prefersReducedMotion } from '../../js/core/motion.js';

const FPS = 24;
const PX_PER_FRAME = 4;   // cada 4 px de scroll avanza un fotograma

/**
 * Barra fija: un timecode que corre a 24 fps como un editor en reproducción
 * (el scroll lo adelanta o lo regresa), el nombre de la pista que está en
 * pantalla y un cabezal que se llena con su color.
 */
export function init(root) {
  const timecode = root.querySelector('[data-ref="timecode"]');
  const trackLabel = root.querySelector('[data-ref="track"]');
  const playhead = root.querySelector('[data-ref="playhead"]');
  // Pistas (tiñen el cabezal) y capítulos (solo ponen nombre)
  const tracks = [...document.querySelectorAll('[data-track], [data-chapter]')];

  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const reduce = prefersReducedMotion();
  const start = performance.now();
  let ticking = false;

  /** Fotograma actual: tiempo de reproducción + lo recorrido con el scroll. */
  function renderTimecode() {
    const played = reduce ? 0 : Math.floor(((performance.now() - start) / 1000) * FPS);
    const frame = played + Math.round(scrollY / PX_PER_FRAME);
    const seconds = Math.floor(frame / FPS);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    timecode.textContent = [pad(hours), pad(minutes % 60), pad(seconds % 60), pad(frame % FPS)].join(':');
  }

  function update() {
    ticking = false;
    const progress = Math.min(1, scrollY / maxScroll());
    playhead.style.transform = `scaleX(${progress})`;
    renderTimecode();

    // Pista activa: la que cruza la línea de 30 % de la pantalla
    const line = innerHeight * .3;
    const current = tracks.find((t) => {
      const r = t.getBoundingClientRect();
      return r.top <= line && r.bottom > line;
    });
    trackLabel.textContent = current ? current.dataset.title : 'Portada';
    root.style.setProperty('--head', current?.hasAttribute('data-track') ? getComputedStyle(current).getPropertyValue('--field') : '');
  }

  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', update);
  update();

  // El reloj corre solo, a 24 fps
  if (!reduce) {
    const tick = () => { renderTimecode(); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
}
