/* Movimiento ligado al scroll (GSAP + ScrollTrigger)
   - Cada pista entra con una cortinilla: su campo de color se abre desde un recuadro.
   - Los títulos de las pistas caen letra por letra.
   - Los textos grandes se iluminan palabra por palabra mientras bajas.
   - Los escenarios suben con parallax y crecen hasta su tamaño.
   - El código entra línea por línea.
   - Los aparatos del prólogo flotan a distintas velocidades.
   - El nombre del cierre sube letra por letra.
   Nada se queda invisible: los estados de partida conservan algo de opacidad. */

/** Envuelve cada palabra (o letra) de un elemento en un <span>. */
function split(node, by = 'word') {
  const parts = [];
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach((text) => {
    const frag = document.createDocumentFragment();
    const pieces = by === 'char' ? [...text.textContent] : text.textContent.split(/(\s+)/);
    pieces.forEach((piece) => {
      if (!piece) return;
      if (!piece.trim()) { frag.append(piece); return; }
      const span = document.createElement('span');
      span.className = by === 'char' ? 'fx-char' : 'fx-word';
      span.textContent = piece;
      frag.append(span);
      parts.push(span);
    });
    text.replaceWith(frag);
  });
  return parts;
}

/** Envuelve cada línea de un <pre> en un bloque. */
function splitLines(pre) {
  const lines = pre.innerHTML.split('\n');
  pre.innerHTML = lines.map((line) => `<span class="fx-line">${line || ' '}</span>`).join('');
  return [...pre.querySelectorAll('.fx-line')];
}

export function initScrollFx() {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);

  // --- Pistas ---
  document.querySelectorAll('.track').forEach((track) => {
    // Cortinilla: el campo de color se abre hasta los bordes
    gsap.fromTo(track,
      { clipPath: 'inset(7% 6% 0% 6%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
        scrollTrigger: { trigger: track, start: 'top bottom', end: 'top 15%', scrub: .6 } });

    // Título de la claqueta: letras que caen en cascada
    const title = track.querySelector('.track__title');
    if (title) {
      const chars = split(title, 'char');
      gsap.from(chars, {
        yPercent: -80, rotate: -12, opacity: .15, duration: .7, ease: 'back.out(2.2)', stagger: .03,
        scrollTrigger: { trigger: track, start: 'top 70%', once: true }
      });
    }

    // Frase principal: se ilumina palabra por palabra
    const lede = track.querySelector('.track__lede');
    if (lede) {
      lede.removeAttribute('data-reveal');
      gsap.fromTo(split(lede), { opacity: .18 }, {
        opacity: 1, stagger: .1, ease: 'none',
        scrollTrigger: { trigger: lede, start: 'top 85%', end: 'top 40%', scrub: true }
      });
    }

    // Escenario: sube mientras una cortinilla lo destapa de arriba abajo
    const stage = track.querySelector('.track__stage');
    if (stage) {
      gsap.fromTo(stage,
        { y: 140, opacity: .35, clipPath: 'inset(0% 0% 45% 0%)' },
        { y: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
          scrollTrigger: { trigger: stage, start: 'top bottom', end: 'top 45%', scrub: .5 } });
    }

    // Código: línea por línea
    const code = track.querySelector('.track__code');
    if (code) {
      gsap.from(splitLines(code), {
        x: -40, opacity: 0, duration: .5, ease: 'power3.out', stagger: .035,
        scrollTrigger: { trigger: code, start: 'top 88%', once: true }
      });
    }
  });

  // --- Prólogo ---
  document.querySelectorAll('[data-words]').forEach((p) => {
    gsap.fromTo(split(p), { opacity: .15 }, {
      opacity: 1, stagger: .1, ease: 'none',
      scrollTrigger: { trigger: p.closest('section') || p, start: 'top 60%', end: '+=70%', scrub: true }
    });
  });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1101px)', () => {
    document.querySelectorAll('.prologo__pic[data-speed]').forEach((pic) => {
      const speed = Number(pic.dataset.speed);
      gsap.fromTo(pic,
        { yPercent: speed * -200 },
        { yPercent: speed * 200, ease: 'none',
          scrollTrigger: { trigger: pic, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

  // --- Criterio: el título entra desde abajo ---
  const crit = document.querySelector('.criterio__title');
  if (crit) {
    gsap.from(split(crit), {
      yPercent: 60, opacity: .15, duration: .8, ease: 'power3.out', stagger: .08,
      scrollTrigger: { trigger: crit, start: 'top 85%', once: true }
    });
  }

  // --- Cierre ---
  const closingTitle = document.querySelector('.closing__title');
  if (closingTitle) {
    gsap.fromTo(split(closingTitle), { yPercent: 70, opacity: .15 }, {
      yPercent: 0, opacity: 1, stagger: .12, ease: 'none',
      scrollTrigger: { trigger: closingTitle, start: 'top 95%', end: 'top 55%', scrub: true }
    });
  }
  const mark = document.querySelector('.closing__mark');
  if (mark) {
    // Sube letra por letra cuando el cierre entra en pantalla (y vuelve a bajar al salir)
    const chars = split(mark, 'char');
    gsap.fromTo(chars, { yPercent: 105, rotate: 10 }, {
      yPercent: 0, rotate: 0, duration: 1.1, ease: 'back.out(1.6)', stagger: .07,
      scrollTrigger: { trigger: mark.closest('footer') || mark, start: 'top 55%', toggleActions: 'play none none reverse' }
    });
    // Cada letra salta al pasar el cursor
    mark.style.pointerEvents = 'auto';
    chars.forEach((char) => char.addEventListener('pointerenter', () => {
      gsap.fromTo(char, { y: 0 }, { y: '-18%', duration: .22, ease: 'power2.out', yoyo: true, repeat: 1, overwrite: 'auto' });
    }));
  }
}
