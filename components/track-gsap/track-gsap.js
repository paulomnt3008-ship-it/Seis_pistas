import { prefersReducedMotion, pad } from '../../js/core/motion.js';

const BAR_HEIGHTS = [.55, .8, .4, 1, .65, .9, .45, .7, .5];
const FPS = 24;

export function init(root) {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  const reduce = prefersReducedMotion();
  const barsBox = root.querySelector('[data-ref="bars"]');
  const word = root.querySelector('[data-ref="word"]');
  const scrub = root.querySelector('[data-ref="scrub"]');
  const frameLabel = root.querySelector('[data-ref="frame"]');

  // Construir barras y letras
  BAR_HEIGHTS.forEach((h) => {
    const bar = document.createElement('div');
    bar.className = 'sequence__bar';
    bar.style.transform = `scaleY(${h})`;
    barsBox.appendChild(bar);
  });
  const text = word.textContent.trim();
  word.textContent = '';
  [...text].forEach((char) => {
    const span = document.createElement('span');
    span.className = 'sequence__letter';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = char;
    word.appendChild(span);
  });

  const bars = barsBox.children;
  const letters = word.children;

  // La timeline
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
    .fromTo(bars, { scaleY: .05 }, { scaleY: 1, duration: .6, stagger: .06 })
    .to(bars, { rotate: (i) => (i % 2 ? 8 : -8), duration: .4, ease: 'back.out(3)', stagger: { each: .04, from: 'center' } }, '-=.2')
    .from(letters, { yPercent: 120, opacity: 0, duration: .5, stagger: .05 }, '<')
    .to(bars, { rotate: 0, scaleY: (i) => BAR_HEIGHTS[i], duration: .9, ease: 'elastic.out(1,.4)' });

  const totalFrames = Math.round(tl.duration() * FPS);
  const sync = () => {
    scrub.value = Math.round(tl.progress() * 1000);
    frameLabel.textContent = `F ${pad(Math.round(tl.progress() * totalFrames), 3)} / ${pad(totalFrames, 3)}`;
  };
  tl.eventCallback('onUpdate', sync);
  tl.progress(1);
  sync();

  // Controles
  root.querySelector('[data-ref="play"]').addEventListener('click', () => tl.restart());
  root.querySelector('[data-ref="reverse"]').addEventListener('click', () =>
    (tl.progress() === 0 ? tl.play() : tl.reverse()));
  scrub.addEventListener('input', () => { tl.pause(); tl.progress(scrub.value / 1000); });

  // Scroll
  const scrollBar = root.querySelector('[data-ref="scrollBar"]');
  if (reduce) {
    gsap.set(scrollBar, { scaleX: 1 });
    return;
  }
  ScrollTrigger.create({ trigger: root, start: 'top 60%', once: true, onEnter: () => tl.restart() });
  gsap.to(scrollBar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true }
  });
}
