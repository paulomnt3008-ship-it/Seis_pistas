import { components } from './components.js';
import { mountAll, loadScript, showLoadError } from './core/loader.js';
import { canReveal, initReveal } from './core/reveal.js';
import { initScrollFx } from './core/scroll-fx.js';

// Alpine se carga después de montar los componentes, para que encuentre
// el marcado de track-alpine y los Alpine.data() ya registrados.
const ALPINE_URL = 'https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js';

// Las entradas animadas ocultan el contenido solo si de verdad pueden mostrarlo
if (canReveal()) document.documentElement.classList.add('js-motion');

try {
  await mountAll(components);
  initScrollFx();
  initReveal();
  await loadScript(ALPINE_URL);
  window.ScrollTrigger?.refresh();
  document.dispatchEvent(new CustomEvent('components:ready'));
} catch (error) {
  document.documentElement.classList.remove('js-motion');
  showLoadError(error);
}
