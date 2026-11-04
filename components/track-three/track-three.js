import { prefersReducedMotion, cssVar } from '../../js/core/motion.js';

const FOLLOW = .06;          // fracción de la distancia al cursor que se avanza por fotograma
const RING_PARTICLES = 600;

function buildScene(root) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
  camera.position.z = 5.2;

  // Figura en la tinta de la pista; puntos en el acento de la página
  const main = new THREE.Color(cssVar('--c', root) || '#1c1c1c');
  const accent = new THREE.Color('#3f5a3e');

  // Icosaedro: malla de alambre + puntos en los vértices + núcleo
  const group = new THREE.Group();
  const geometry = new THREE.IcosahedronGeometry(1.5, 2);
  group.add(new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({ color: main, transparent: true, opacity: .7 })
  ));
  group.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: accent, size: .09 })));
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(.7, 0),
    new THREE.MeshBasicMaterial({ color: main, wireframe: true })
  );
  group.add(core);
  scene.add(group);

  // Anillo de partículas
  const positions = new Float32Array(RING_PARTICLES * 3);
  for (let i = 0; i < RING_PARTICLES; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2.3 + Math.random() * .6;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - .5) * .25;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const ringGeometry = new THREE.BufferGeometry();
  ringGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const ring = new THREE.Points(ringGeometry,
    new THREE.PointsMaterial({ color: main, size: .025, transparent: true, opacity: .8 }));
  ring.rotation.x = .45;
  scene.add(ring);

  return { scene, camera, group, core, ring };
}

export function init(root) {
  if (!window.THREE) return;

  const reduce = prefersReducedMotion();
  const canvas = root.querySelector('[data-ref="canvas"]');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  const { scene, camera, group, core, ring } = buildScene(root);

  const target = { x: 0, y: 0 };
  const rotation = { x: 0, y: 0 };
  let visible = false;
  let time = 0;
  let last = performance.now();

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function render(now = performance.now()) {
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    if (!reduce) time += dt * .25;

    rotation.x += (target.y - rotation.x) * FOLLOW;
    rotation.y += (target.x - rotation.y) * FOLLOW;
    group.rotation.set(rotation.x, rotation.y + time, 0);
    ring.rotation.y = -time * .6;
    renderer.render(scene, camera);

    if (visible && !reduce) requestAnimationFrame(render);
  }

  // Interacción
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    target.x = ((e.clientX - r.left) / r.width - .5) * 2;
    target.y = ((e.clientY - r.top) / r.height - .5) * 1.4;
    if (reduce) requestAnimationFrame(render);
  });
  canvas.addEventListener('pointerleave', () => { target.x = 0; target.y = 0; });
  canvas.addEventListener('click', () => {
    if (window.gsap) {
      gsap.fromTo(group.scale, { x: 1.4, y: 1.4, z: 1.4 }, { x: 1, y: 1, z: 1, duration: 1.2, ease: 'elastic.out(1,.35)' });
      gsap.fromTo(core.rotation, { z: 0 }, { z: Math.PI, duration: 1.2, ease: 'power3.out' });
    }
    if (reduce) requestAnimationFrame(render);
  });

  // Solo renderiza mientras el lienzo está en pantalla
  new ResizeObserver(() => { resize(); render(); }).observe(canvas);
  new IntersectionObserver(([entry]) => {
    const wasVisible = visible;
    visible = entry.isIntersecting;
    if (visible && !wasVisible) { last = performance.now(); render(); }
  }).observe(canvas);

  resize();
  render();
}
