import { prefersReducedMotion } from '../../js/core/motion.js';

const PHONE = 900;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Mide la ventana inicial: un retrato 4:5 centrado. */
function measure() {
  const vw = innerWidth;
  const vh = innerHeight;
  if (vw <= PHONE) {
    const h = Math.min(vw * .78 * 1.25, vh * .46);
    const w = h / 1.25;
    const top = vh * .5 - h * .5 - vh * .02;
    return { top, side: (vw - w) / 2, bottom: vh - top - h };
  }
  const h = Math.min(vw * .36 * 1.25, vh * .72);
  const w = h / 1.25;
  const top = (vh - h) / 2;
  return { top, side: (vw - w) / 2, bottom: top };
}

/* La escena: seis pistas de movimiento, como los carriles de un editor de video.
   Cada carril tiene el color de su herramienta y una tira de cuadros que corre
   sin parar; dentro de cada cuadro se repite la animación típica de esa
   herramienta. Un cabezal de reproducción barre las seis pistas. Todo es CSS. */
const LANES = [
  { tone: 'css',    name: 'CSS',      shape: '<i class="f-ball"></i><b class="f-floor"></b>', dur: 19 },
  { tone: 'tw',     name: 'Tailwind', shape: '<i class="f-square"></i>', dur: 23 },
  { tone: 'gsap',   name: 'GSAP',     shape: '<i class="f-bar"></i><i class="f-bar"></i><i class="f-bar"></i><i class="f-bar"></i><i class="f-bar"></i>', dur: 17 },
  { tone: 'anime',  name: 'Anime.js', shape: Array.from({ length: 9 }, () => '<i class="f-dot"></i>').join(''), dur: 21 },
  { tone: 'three',  name: 'Three.js', shape: '<i class="f-cube"></i>', dur: 25 },
  { tone: 'alpine', name: 'Alpine',   shape: '<i class="f-row"></i><i class="f-row"></i><i class="f-row"></i>', dur: 18 }
];
/** Cuadros por tira: una copia de la tira debe cubrir al menos toda la altura. */
function framesPerStrip() {
  const laneWidth = innerWidth / 6;
  const frameHeight = laneWidth * 1.2;          // cuadros 5:6
  return Math.max(6, Math.ceil(innerHeight / frameHeight) + 1);
}

function buildScene(container) {
  const count = framesPerStrip();
  const lanes = LANES.map((lane, li) => {
    // Cada cuadro arranca su animación en un punto distinto (retraso negativo)
    const frames = Array.from({ length: count }, (_, k) =>
      `<div class="rf rf--${lane.tone}" style="--k:${k}">${lane.shape}</div>`).join('');
    return `<div class="lane tone-${lane.tone}" style="--dur:${lane.dur}s; --dir:${li % 2 ? 'reverse' : 'normal'}; --li:${li}">
      <span class="lane__name">${lane.name}</span>
      <div class="lane__strip">${frames}${frames}</div>
    </div>`;
  }).join('');
  // El fondo de los seis carriles es un SVG: un campo de color por pista
  const fields = LANES.map((lane, i) =>
    `<rect x="${i}" y="0" width="1" height="1" fill="var(--t-${lane.tone})"/>`).join('');
  container.innerHTML = `<svg class="lanes__ground" viewBox="0 0 6 1" preserveAspectRatio="none" aria-hidden="true">${fields}</svg>`
    + `<div class="lanes">${lanes}</div><div class="hero__playhead"></div>`;
  return count;
}

/**
 * La ventana se abre hasta los bordes durante la primera pantalla de scroll.
 * El texto sube y se desvanece antes de que la abertura lo alcance.
 */
export function init(root) {
  const reduce = prefersReducedMotion();
  const stage = root.querySelector('[data-ref="stage"]');
  const copy = root.querySelector('[data-ref="copy"]');
  const caption = root.querySelector('[data-ref="caption"]');
  const sceneBox = root.querySelector('[data-ref="scene"]');
  let built = buildScene(sceneBox);
  let box = measure();
  let ticking = false;

  function apply(p) {
    const k = 1 - easeInOut(p);
    stage.style.setProperty('--win-top', `${box.top * k}px`);
    stage.style.setProperty('--win-side', `${box.side * k}px`);
    stage.style.setProperty('--win-bottom', `${box.bottom * k}px`);
    copy.style.setProperty('--win-bottom', `${box.bottom}px`);

    const fade = clamp01(p * 2.6);
    copy.style.opacity = String(1 - fade);
    copy.style.transform = `translateY(${-fade * 60}px)`;
    copy.style.visibility = fade >= 1 ? 'hidden' : 'visible';
    caption.style.opacity = String(clamp01((p - .75) / .25));
  }

  function update() {
    ticking = false;
    const top = root.getBoundingClientRect().top;
    apply(reduce ? 0 : clamp01(-top / innerHeight));
  }

  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', () => {
    box = measure();
    update();
    // Si cambia cuántos cuadros caben, se rehacen las tiras
    if (framesPerStrip() !== built) built = buildScene(sceneBox);
  });
  update();

  if (reduce) return;

  // Las tiras solo corren mientras la portada está en pantalla
  new IntersectionObserver(([entry]) => {
    sceneBox.classList.toggle('is-paused', !entry.isIntersecting);
  }).observe(stage);

  // Entrada: el título sube y la escena se asienta
  if (window.gsap) {
    gsap.from(root.querySelector('.hero__title'), { yPercent: 40, opacity: 0, duration: 1, ease: 'power3.out', delay: .1 });
    gsap.from(root.querySelectorAll('.hero__side > *'), { y: 24, opacity: 0, duration: .8, ease: 'power3.out', stagger: .08, delay: .35 });
    // Los carriles entran alternados: uno cae, el siguiente sube
    gsap.from(root.querySelectorAll('.lane'), {
      yPercent: (i) => (i % 2 ? 100 : -100), duration: 1.2, ease: 'expo.out', stagger: .08
    });
  }
}
