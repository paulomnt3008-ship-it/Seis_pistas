/* Entradas al hacer scroll
   Cada grupo [data-reveal-group] anima a sus hijos [data-reveal] en cascada
   (título, texto, imagen) la primera vez que entra en pantalla.
   Todo lo que ya quedó arriba de la pantalla también se muestra, así que
   saltar directo al final de la página nunca deja contenido invisible.
   El contenido solo se oculta si GSAP está disponible y no se pidió reducir
   el movimiento (la clase .js-motion la pone main.js antes de montar). */

const EXTRA = [
  // Piezas que no viven en un grupo pero también entran
  // (los escenarios y el código los mueve scroll-fx.js)
  '.prologo__pic .device'
];
const LINE = .9; // un elemento entra cuando su borde superior cruza el 90 % de la pantalla

export function canReveal() {
  return Boolean(window.gsap) &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initReveal() {
  if (!canReveal()) return;

  document.querySelectorAll(EXTRA.join(',')).forEach((el) => el.setAttribute('data-reveal', ''));

  // Unidades pendientes: un grupo (cascada) o una pieza suelta
  let pending = [
    ...[...document.querySelectorAll('[data-reveal-group]')].map((group) => ({
      trigger: group,
      items: group.querySelectorAll('[data-reveal]'),
      stagger: .08
    })),
    ...[...document.querySelectorAll('[data-reveal]')]
      .filter((el) => !el.closest('[data-reveal-group]'))
      .map((el) => ({ trigger: el, items: [el], stagger: 0 }))
  ];

  let ticking = false;
  function check() {
    ticking = false;
    const line = innerHeight * LINE;
    pending = pending.filter((unit) => {
      if (unit.trigger.getBoundingClientRect().top > line) return true;
      gsap.to(unit.items, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: unit.stagger });
      return false;
    });
    if (!pending.length) removeEventListener('scroll', onScroll);
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(check); }
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  check();
}
