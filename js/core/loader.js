/* Cargador de componentes
   1. Trae en paralelo el HTML y el CSS de todos los componentes.
   2. Reemplaza cada <div data-component="nombre"> por su marcado.
   3. Cuando todo el marcado está en la página, importa cada módulo JS
      y llama a init(root), en el orden del registro.                     */

const COMPONENTS_DIR = new URL('../../components/', import.meta.url);

const fileUrl = (name, ext) => new URL(`${name}/${name}.${ext}`, COMPONENTS_DIR);

function loadStyle(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url.href;
    link.onload = resolve;
    link.onerror = () => reject(new Error(`No se pudo cargar ${url.pathname}`));
    document.head.appendChild(link);
  });
}

async function loadMarkup(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`No se pudo cargar ${url.pathname} (${response.status})`);
  const template = document.createElement('template');
  template.innerHTML = (await response.text()).trim();
  return template.content;
}

export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(script);
  });
}

export async function mountAll(list) {
  // 1. Marcado y estilos en paralelo
  const fragments = await Promise.all(list.map(async ({ name, css }) => {
    const [fragment] = await Promise.all([
      loadMarkup(fileUrl(name, 'html')),
      css ? loadStyle(fileUrl(name, 'css')) : null
    ]);
    return fragment;
  }));

  // 2. Insertar en su contenedor
  const roots = list.map(({ name }, i) => {
    const slot = document.querySelector(`[data-component="${name}"]`);
    if (!slot) throw new Error(`Falta <div data-component="${name}"> en index.html`);
    const root = fragments[i].firstElementChild;
    slot.replaceWith(fragments[i]);
    return root;
  });

  // 3. Lógica de cada componente, en orden.
  //    Si uno falla, se reporta en consola y los demás siguen funcionando.
  for (const [i, { name, js }] of list.entries()) {
    if (!js) continue;
    try {
      const module = await import(fileUrl(name, 'js').href);
      module.init?.(roots[i]);
    } catch (error) {
      console.error(`[${name}] no se pudo inicializar:`, error);
    }
  }
}

export function showLoadError(error) {
  console.error(error);
  const box = document.createElement('div');
  box.className = 'load-error';
  box.setAttribute('role', 'alert');

  const title = document.createElement('strong');
  title.textContent = 'No se pudieron cargar los componentes.';
  const detail = document.createElement('p');
  detail.textContent = error.message;
  const hint = document.createElement('p');
  hint.innerHTML = 'Abre la página desde un servidor local, por ejemplo con <code>npx serve .</code>, en lugar de abrir el archivo con doble clic.';

  box.append(title, detail, hint);
  (document.querySelector('main') ?? document.body).prepend(box);
}
