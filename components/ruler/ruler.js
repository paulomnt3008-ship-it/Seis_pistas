import { prefersReducedMotion, pad } from '../../js/core/motion.js';

const FPS = 24;
const PX_PER_FRAME = 4;   // cada 4 px de scroll avanza un fotograma
const HEADER_OFFSET = 64;

/**
 * Regla fija: mueve el cabezal según el scroll, muestra el timecode
 * y crea un rombo por cada pista ([data-track]) que lleva a ella.
 */
export function init(root) {
  const reduce = prefersReducedMotion();
  const timecode = root.querySelector('[data-ref="timecode"]');
  const scale = root.querySelector('[data-ref="scale"]');
  const playhead = root.querySelector('[data-ref="playhead"]');
  const tracks = [...document.querySelectorAll('[data-track]')];

  const markers = tracks.map((track) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ruler__marker';
    button.style.setProperty('--c', getComputedStyle(track).getPropertyValue('--c'));
    button.setAttribute('aria-label', `Ir a ${track.dataset.title}`);
    button.addEventListener('click', () =>
      track.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));
    scale.appendChild(button);
    return button;
  });

  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);

  function layoutMarkers() {
    const max = maxScroll();
    tracks.forEach((track, i) => {
      const p = Math.min(1, Math.max(0, (track.offsetTop - HEADER_OFFSET) / max));
      markers[i].style.left = `${p * 100}%`;
    });
  }

  function update() {
    const progress = Math.min(1, scrollY / maxScroll());
    playhead.style.left = `${progress * 100}%`;

    const frame = Math.round(scrollY / PX_PER_FRAME);
    const seconds = Math.floor(frame / FPS);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    timecode.innerHTML = '<small>TC</small>' +
      [pad(hours), pad(minutes % 60), pad(seconds % 60), pad(frame % FPS)].join(':');
  }

  addEventListener('scroll', update, { passive: true });
  new ResizeObserver(() => { layoutMarkers(); update(); }).observe(document.body);
  document.fonts?.ready.then(layoutMarkers);

  layoutMarkers();
  update();
}
