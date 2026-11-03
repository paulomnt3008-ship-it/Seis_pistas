/* Utilidades compartidas por los componentes animados */

/** true si la persona pidió reducir el movimiento en su sistema. */
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Lee una variable CSS (por ejemplo '--t-three') ya resuelta. */
export const cssVar = (name, el = document.documentElement) =>
  getComputedStyle(el).getPropertyValue(name).trim();

/** Rellena con ceros a la izquierda: pad(7) → '07', pad(7, 3) → '007'. */
export const pad = (n, size = 2) => String(n).padStart(size, '0');
