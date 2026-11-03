import { prefersReducedMotion, pad } from '../../js/core/motion.js';

const LOOP_MS = 6000;
const TOTAL_FRAMES = 96;
const HIT_RANGE = 2.2; // % de distancia a la que un keyframe se "enciende"

/** Envuelve cada letra visible de un elemento en <span class="hero__letter">. */
function splitLetters(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    for (const char of node.textContent) {
      if (!char.trim()) { fragment.append(char); continue; }
      const span = document.createElement('span');
      span.className = 'hero__letter';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = char;
      fragment.append(span);
    }
    node.replaceWith(fragment);
  });
}

/** Dibuja keyframes y segmentos en cada carril a partir de data-keys. */
function buildLanes(root) {
  const keys = [];
  root.querySelectorAll('.dope__lane').forEach((lane) => {
    const positions = lane.dataset.keys.split(',').map(Number);

    positions.slice(0, -1).forEach((start, i) => {
      const seg = document.createElement('div');
      seg.className = 'dope__seg';
      seg.style.left = `${start}%`;
      seg.style.width = `${positions[i + 1] - start}%`;
      lane.appendChild(seg);
    });

    positions.forEach((at) => {
      const key = document.createElement('i');
      key.className = 'dope__key';
      key.style.left = `${at}%`;
      lane.appendChild(key);
      keys.push({ el: key, at });
    });
  });
  return keys;
}

export function init(root) {
  const reduce = prefersReducedMotion();
  const title = root.querySelector('[data-ref="title"]');
  const playhead = root.querySelector('[data-ref="playhead"]');
  const frameLabel = root.querySelector('[data-ref="frame"]');

  splitLetters(title);
  const keys = buildLanes(root);

  function setPlayhead(percent) {
    playhead.style.setProperty('--p', percent / 100);
    frameLabel.textContent = `F ${pad(Math.round(percent * TOTAL_FRAMES / 100), 3)}`;
    keys.forEach(({ el, at }) => el.classList.toggle('is-hit', Math.abs(at - percent) < HIT_RANGE));
  }

  if (reduce) {
    setPlayhead(40);
  } else {
    const start = performance.now();
    const loop = (now) => {
      setPlayhead(((now - start) % LOOP_MS) / LOOP_MS * 100);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  if (!reduce && window.gsap) {
    gsap.from(title.querySelectorAll('.hero__letter'), {
      y: 18,
      rotate: () => gsap.utils.random(-12, 12),
      duration: .8,
      ease: 'back.out(2)',
      stagger: .03
    });
  }
}
