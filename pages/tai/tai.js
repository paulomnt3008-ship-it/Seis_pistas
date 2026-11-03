/* Página "Solo para Tai"
   1. Entrada: el corazón se dibuja, late y el mensaje sube palabra por palabra (GSAP).
   2. Fondo: corazones que flotan hacia arriba en un canvas.
   3. Al tocar la pantalla salen corazones desde ese punto.
   4. "Volver" cierra con un telón circular y regresa al portafolio.              */

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (ref) => document.querySelector(`[data-ref="${ref}"]`);

const HEART = new Path2D('M50 86 C20 64 2 46 2 28 C2 12 14 2 28 2 C38 2 46 8 50 16 C54 8 62 2 72 2 C86 2 98 12 98 28 C98 46 80 64 50 86 Z');
const COLORS = ['255,143,163', '255,194,204', '243,201,139'];

/* ---------- 1. Entrada ---------- */

/** Envuelve cada palabra en <span class="tai__word"><span>…</span></span>. */
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  words.forEach((word, i) => {
    const mask = document.createElement('span');
    mask.className = 'tai__word';
    const inner = document.createElement('span');
    inner.textContent = word;
    mask.appendChild(inner);
    el.appendChild(mask);
    if (i < words.length - 1) el.append(' ');
  });
  return [...el.querySelectorAll('.tai__word > span')];
}

function playIntro() {
  const heart = $('heart');
  const heartLine = $('heartLine');
  const message = $('message');
  message.setAttribute('aria-label', message.textContent.replace(/\s+/g, ' ').trim());

  const lineWords = [...message.querySelectorAll('.tai__line')].flatMap(splitWords);
  const loveWords = splitWords(message.querySelector('.tai__love'));
  message.querySelectorAll('.tai__word').forEach((w) => w.setAttribute('aria-hidden', 'true'));

  document.documentElement.classList.remove('pre');

  if (reduce || !window.gsap) {
    heart.classList.add('is-beating');
    return;
  }

  const length = heartLine.getTotalLength();
  gsap.set(heartLine, { strokeDasharray: length, strokeDashoffset: length, fillOpacity: 0 });

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.tai__label', { opacity: 0, y: 10, duration: .8 })
    .to(heartLine, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, '<.1')
    .to(heartLine, { fillOpacity: 1, duration: .6 }, '-=.2')
    .fromTo(heart, { scale: .6 }, { scale: 1, duration: 1.1, ease: 'elastic.out(1,.4)', transformOrigin: '50% 50%' }, '<')
    .from(lineWords, { yPercent: 115, duration: .8, stagger: .07 }, '-=.6')
    .from(loveWords, { yPercent: 115, rotate: 6, duration: 1, stagger: .14, ease: 'back.out(1.7)' }, '+=.15')
    .from(['.tai__hint', '.tai__back'], { opacity: 0, duration: .8 }, '+=.2')
    .add(() => {
      gsap.set(heart, { clearProps: 'transform' });
      heart.classList.add('is-beating');
      burst(innerWidth / 2, heart.getBoundingClientRect().top + heart.clientHeight / 2);
    }, '-=.8');
}

/* ---------- 2 y 3. Cielo de corazones ---------- */

const canvas = $('sky');
const ctx = canvas.getContext('2d');
let width = 0;
let height = 0;
const floaters = [];
const sparks = [];

function resize() {
  const dpr = Math.min(2, devicePixelRatio || 1);
  width = innerWidth;
  height = innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function makeFloater(anywhere) {
  return {
    x: Math.random() * width,
    y: anywhere ? Math.random() * height : height + 30,
    size: 8 + Math.random() * 22,
    speed: 12 + Math.random() * 28,
    sway: 10 + Math.random() * 24,
    phase: Math.random() * Math.PI * 2,
    alpha: .08 + Math.random() * .22,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  };
}

function drawHeart(x, y, size, alpha, color, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(size / 100, size / 100);
  ctx.translate(-50, -45);
  ctx.fillStyle = `rgba(${color},${alpha})`;
  ctx.fill(HEART);
  ctx.restore();
}

function burst(x, y) {
  if (reduce) return;
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 180;
    sparks.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 60,
      size: 10 + Math.random() * 14,
      life: 1,
      spin: (Math.random() - .5) * 3,
      rotation: 0,
      color: COLORS[i % COLORS.length]
    });
  }
}

let time = 0;
let last = performance.now();

function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000);
  last = now;
  time += dt;
  ctx.clearRect(0, 0, width, height);

  floaters.forEach((f, i) => {
    f.y -= f.speed * dt;
    if (f.y < -40) floaters[i] = makeFloater(false);
    drawHeart(f.x + Math.sin(time * .8 + f.phase) * f.sway, f.y, f.size, f.alpha, f.color, Math.sin(time + f.phase) * .2);
  });

  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.vy -= 40 * dt;           // flotan hacia arriba
    s.vx *= .98;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.rotation += s.spin * dt;
    s.life -= dt * .8;
    if (s.life <= 0) { sparks.splice(i, 1); continue; }
    drawHeart(s.x, s.y, s.size, s.life * .9, s.color, s.rotation);
  }

  requestAnimationFrame(frame);
}

function startSky() {
  resize();
  const count = Math.round(Math.min(60, width * height / 22000));
  for (let i = 0; i < count; i++) floaters.push(makeFloater(true));
  addEventListener('resize', resize);

  if (reduce) {
    floaters.forEach((f) => drawHeart(f.x, f.y, f.size, f.alpha, f.color));
    return;
  }
  requestAnimationFrame(frame);

  document.addEventListener('pointerdown', (event) => {
    if (event.target.closest('a')) return;
    burst(event.clientX, event.clientY);
  });
}

/* ---------- 4. Volver ---------- */

function setupBack() {
  const back = $('back');
  back.addEventListener('click', (event) => {
    if (reduce || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();

    const r = back.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const iris = document.createElement('div');
    iris.className = 'tai__iris';
    document.body.appendChild(iris);
    iris.animate(
      [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${radius}px at ${x}px ${y}px)` }],
      { duration: 800, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }
    ).finished.then(() => { window.location.href = back.href; });
  });

  addEventListener('pageshow', (event) => {
    if (event.persisted) document.querySelectorAll('.tai__iris').forEach((el) => el.remove());
  });
}

playIntro();
startSky();
setupBack();
