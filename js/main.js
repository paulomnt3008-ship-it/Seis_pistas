import { components } from './components.js';
import { mountAll, loadScript, showLoadError } from './core/loader.js';

// Alpine se carga después de montar los componentes, para que encuentre
// el marcado de track-alpine y los Alpine.data() ya registrados.
const ALPINE_URL = 'https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js';

try {
  await mountAll(components);
  await loadScript(ALPINE_URL);
  window.ScrollTrigger?.refresh();
  document.dispatchEvent(new CustomEvent('components:ready'));
} catch (error) {
  showLoadError(error);
}
