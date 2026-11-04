/* Dibujos hechos con código (SVG), compartidos por varios componentes.
   Todo lo visual de la página sale de aquí o de CSS: no hay imágenes. */

const NS = 'http://www.w3.org/2000/svg';

/** Crea un elemento SVG con atributos. */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  children.forEach((c) => node.appendChild(c));
  return node;
}

/** Colores de las seis pistas, leídos de los tokens. */
export function trackColors() {
  const css = getComputedStyle(document.documentElement);
  return ['--t-css', '--t-tw', '--t-gsap', '--t-anime', '--t-three', '--t-alpine']
    .map((name) => css.getPropertyValue(name).trim());
}

/**
 * Poses de un salto de pelota en n cuadros.
 * Devuelve, para cada cuadro, la altura (0 = suelo, 1 = punto más alto)
 * y la escala (aplasta al tocar el suelo, se estira al subir y bajar rápido).
 */
export function hopPoses(n = 12) {
  return Array.from({ length: n }, (_, i) => {
    const t = i / n;                       // 0 → 1 a lo largo del salto
    const h = Math.sin(Math.PI * t);       // parábola aproximada
    const speed = Math.abs(Math.cos(Math.PI * t));
    const contact = i === 0;
    const sx = contact ? 1.35 : 1 - speed * .1;
    const sy = contact ? .65 : 1 + speed * .12;
    return { t, h, sx, sy };
  });
}

/**
 * Disco de fenaquistiscopio con `frames` dibujos de una pelota que rebota.
 * Cada sector guarda una pose; al girar exactamente un sector por paso
 * (steps), cada posición muestra la pose siguiente y la pelota rebota.
 */
export function phenakistiscope({ frames = 12, ink = '#1c1c1c', paper = '#f1f1ef', accent = '#f2b544', label } = {}) {
  const R = 100;
  const poses = hopPoses(frames);
  const disc = el('svg', { viewBox: '-104 -104 208 208', role: 'img', 'aria-label': label || `Disco de fenaquistiscopio con ${frames} dibujos de una pelota que rebota` });
  disc.appendChild(el('circle', { r: R, fill: paper }));
  disc.appendChild(el('circle', { r: 30, fill: accent }));
  disc.appendChild(el('circle', { r: 6, fill: ink }));

  poses.forEach((pose, i) => {
    const angle = (360 / frames) * i;
    const g = el('g', { transform: `rotate(${angle})` });
    // Ranura del borde: por ella se miraba la animación
    g.appendChild(el('rect', { x: -3, y: -R + 2, width: 6, height: 14, fill: ink }));
    // Suelo de cada cuadro
    g.appendChild(el('rect', { x: -12, y: -40, width: 24, height: 4, fill: ink }));
    // La pelota: sube hacia el borde según la altura de la pose
    const r = 12;
    const y = -40 - r * pose.sy - pose.h * 30;
    g.appendChild(el('ellipse', { cx: 0, cy: y, rx: r * pose.sx, ry: r * pose.sy, fill: ink }));
    disc.appendChild(g);
  });
  return disc;
}

/** Un cuadro con la pelota en una pose (para tiras, hojas de contactos, etc.). */
export function poseFrame(pose, { ball = '#1c1c1c', paper = '#dddcd8', ink = '#1c1c1c', w = 100, h = 80 } = {}) {
  const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, 'aria-hidden': 'true' });
  svg.appendChild(el('rect', { width: w, height: h, fill: paper }));
  svg.appendChild(el('rect', { y: h - 12, width: w, height: 4, fill: ink }));
  const r = 11;
  svg.appendChild(el('ellipse', {
    cx: w / 2, cy: h - 12 - r * pose.sy - pose.h * 40,
    rx: r * pose.sx, ry: r * pose.sy, fill: ball
  }));
  return svg;
}
