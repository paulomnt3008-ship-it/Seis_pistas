import { prefersReducedMotion } from '../../js/core/motion.js';
import { el, hopPoses, phenakistiscope, poseFrame, trackColors } from '../../js/core/draw.js';

/* Cuatro aparatos de antes del cine, hechos con código.
   Todos repiten la misma pelota que salta, cada uno con su técnica. */

/** Fenaquistiscopio: el disco gira un sector por paso. */
function disc(box, colors, reduce) {
  const svg = phenakistiscope({ frames: 10, paper: '#dddcd8', accent: colors[3] });
  box.appendChild(svg);
  if (!reduce) svg.animate(
    [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-360deg)' }],
    { duration: 900, iterations: Infinity, easing: 'steps(10, end)' }
  );
}

const frame = (pose, color, w, h) => poseFrame(pose, { ball: color, w, h });

/** Zoótropo: la tira pasa por la ranura, un cuadro por paso. */
function zoetrope(box, colors, reduce) {
  const poses = hopPoses(8);
  const strip = document.createElement('div');
  strip.className = 'zoetrope__strip';
  // Dos vueltas de la tira para que el bucle no tenga corte
  [...poses, ...poses].forEach((p) => strip.appendChild(frame(p, colors[1])));
  const slot = document.createElement('div');
  slot.className = 'zoetrope__slot';
  box.append(strip, slot);
  if (!reduce) strip.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
    { duration: 1400, iterations: Infinity, easing: 'steps(8, end)' }
  );
}

/** Película: la tira sube cuadro por cuadro entre perforaciones. */
function film(box, colors, reduce) {
  const poses = hopPoses(8);
  const strip = document.createElement('div');
  strip.className = 'film__strip';
  [...poses, ...poses].forEach((p) => {
    // Un cuadro de película: negro, con perforaciones a los lados y la imagen al centro
    const cell = el('svg', { viewBox: '0 0 140 100', 'aria-hidden': 'true' });
    cell.appendChild(el('rect', { width: 140, height: 100, fill: '#111' }));
    [8, 58].forEach((y) => {
      cell.appendChild(el('rect', { x: 6, y, width: 10, height: 30, fill: '#dddcd8' }));
      cell.appendChild(el('rect', { x: 124, y, width: 10, height: 30, fill: '#dddcd8' }));
    });
    const img = frame(p, colors[0], 100, 80);
    img.setAttribute('x', 20); img.setAttribute('y', 10);
    img.setAttribute('width', 100); img.setAttribute('height', 80);
    cell.appendChild(img);
    strip.appendChild(cell);
  });
  box.appendChild(strip);
  if (!reduce) strip.animate(
    [{ transform: 'translateY(0)' }, { transform: 'translateY(-50%)' }],
    { duration: 1100, iterations: Infinity, easing: 'steps(8, end)' }
  );
}

/** Cronofotografía: las poses aparecen una tras otra sobre la misma placa. */
function chrono(box, colors, reduce) {
  const W = 320, H = 200, GROUND = 168, R = 14;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' });
  svg.appendChild(el('rect', { width: W, height: H, fill: '#1c1c1c' }));
  svg.appendChild(el('rect', { y: GROUND, width: W, height: 5, fill: '#dddcd8' }));
  const poses = hopPoses(10);
  poses.forEach((p, i) => {
    const ball = el('ellipse', {
      cx: 34 + i * 28, cy: GROUND - R * p.sy - p.h * 110,
      rx: R * p.sx, ry: R * p.sy, fill: colors[i % 6]
    });
    svg.appendChild(ball);
    if (!reduce) ball.animate(
      [{ opacity: 0 }, { opacity: 0, offset: i / 12 }, { opacity: 1, offset: i / 12 + .01 }, { opacity: 1, offset: .92 }, { opacity: 0 }],
      { duration: 2400, iterations: Infinity }
    );
  });
  box.appendChild(svg);
}

const DEVICES = { disc, zoetrope, film, chrono };

export function init(root) {
  const reduce = prefersReducedMotion();
  const colors = trackColors();
  root.querySelectorAll('[data-device]').forEach((box) => DEVICES[box.dataset.device]?.(box, colors, reduce));
}
