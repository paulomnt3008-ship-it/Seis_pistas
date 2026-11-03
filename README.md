# Seis Pistas de Movimiento

Portafolio de animación frontend organizado por componentes. Cada sección de la página
vive en su propia carpeta con su HTML, su CSS y su JS, sin mezclarse con las demás.

## Cómo correrlo

Los componentes se cargan con `fetch()` y módulos ES, así que la página necesita un
servidor local. Si abres `index.html` con doble clic, el navegador bloquea esas cargas.

```bash
npx serve .          # o: npm run dev
```

También funciona la extensión **Live Server** de VS Code o `python -m http.server`.

No hay paso de build: todas las librerías se cargan desde CDN.

## Páginas

- `index.html`: el portafolio. Al final tiene la escena post-créditos con el botón **Solo para Tai**.
- `tai.html`: la página del mensaje. El botón llega aquí con un telón circular; también se puede
  abrir directo con `/tai.html`.

## Publicar en GitHub Pages

1. Crea un repositorio público en GitHub, por ejemplo `seis-pistas`.
2. Sube el contenido de esta carpeta (no la carpeta en sí: `index.html` debe quedar en la raíz).
   - Desde la web: **Add file → Upload files**, arrastra todos los archivos y carpetas, y **Commit changes**.
   - Desde la terminal:
     ```bash
     git init
     git add .
     git commit -m "Portafolio Seis Pistas"
     git branch -M main
     git remote add origin https://github.com/TU-USUARIO/seis-pistas.git
     git push -u origin main
     ```
3. En el repositorio: **Settings → Pages**. En *Build and deployment* elige
   **Source: Deploy from a branch**, rama **main** y carpeta **/ (root)**. Guarda.
4. Espera uno o dos minutos. La página queda en
   `https://TU-USUARIO.github.io/seis-pistas/` y el mensaje en
   `https://TU-USUARIO.github.io/seis-pistas/tai.html`.

El archivo `.nojekyll` le indica a GitHub que sirva los archivos tal cual, sin procesarlos.
GitHub Pages ya es un servidor, así que la carga de componentes funciona sin configurar nada más.

## Estructura

```
seis-pistas/
├── index.html                 Esqueleto: <head>, librerías y un contenedor por componente
├── css/
│   ├── tokens.css             Colores, tipografías y clases .tone-* (color de cada pista)
│   ├── base.css               Reset mínimo y estilos del documento
│   ├── ui.css                 Piezas reutilizables: .btn, .controls, .readout…
│   └── track-layout.css       Esqueleto común de las pistas: cabecera, escenario, código
├── js/
│   ├── main.js                Punto de entrada: monta componentes y arranca Alpine
│   ├── components.js          Registro de componentes, en orden
│   ├── config/
│   │   └── tailwind.config.js Configuración del Play CDN (keyframe propio, safelist)
│   └── core/
│       ├── loader.js          Trae HTML/CSS/JS de cada componente y llama a init(root)
│       └── motion.js          Utilidades: prefersReducedMotion(), cssVar(), pad()
└── components/
    ├── ruler/                 Regla fija con timecode y rombos de navegación
    ├── hero/                  Título por letras y dope sheet animado
    ├── track-css/             V1 · CSS + Web Animations API
    ├── track-tailwind/        V2 · Tailwind (sin JS: todo son clases)
    ├── track-gsap/            V3 · GSAP + ScrollTrigger
    ├── track-anime/           V4 · Anime.js
    ├── track-three/           V5 · Three.js
    ├── track-alpine/          V6 · Alpine.js
    ├── footer/                Cierre y versiones de librerías
    └── tai-button/            Botón "Solo para Tai" y telón de transición
tai.html                       Página del mensaje
pages/tai/                     Estilos (tai.css) y animación (tai.js) de esa página
```

## Cómo funciona el cargador

1. `index.html` tiene un `<div data-component="nombre">` por cada componente.
2. `js/core/loader.js` descarga en paralelo `components/<nombre>/<nombre>.html` y su `.css`.
3. Reemplaza cada contenedor por su marcado.
4. Con todo el marcado ya en la página, importa `<nombre>.js` y llama a `init(root)`,
   donde `root` es el elemento raíz del componente.
5. `js/main.js` carga Alpine al final, para que encuentre el marcado y los `Alpine.data()`
   ya registrados.

## Convenciones

- **Un elemento raíz por componente.** El `.html` empieza con una sola etiqueta
  (`<section>`, `<header>`, `<footer>`).
- **Clases con prefijo del componente** (estilo BEM): `.ruler__tc`, `.easing__ball`,
  `.tasks__item`. Así el CSS de un componente no afecta a otro.
- **Ganchos para JS con `data-ref`**, nunca con clases de estilo:
  `root.querySelector('[data-ref="ball"]')`. Cambiar el diseño no rompe la lógica.
- **Cada JS busca solo dentro de su `root`**, salvo la regla, que lee todas las
  `[data-track]` para crear sus rombos.
- **Colores solo desde tokens.** Cada pista pone su clase `.tone-*` y usa `var(--c)`.
- **Movimiento reducido.** Todo componente animado consulta `prefersReducedMotion()`
  o tiene su regla `@media (prefers-reduced-motion: reduce)`.

## Agregar un componente

1. Crea `components/mi-componente/` con `mi-componente.html` (y `.css` / `.js` si los necesita).
2. Si tiene JS, exporta `init(root)`:
   ```js
   export function init(root) {
     const boton = root.querySelector('[data-ref="boton"]');
     // …
   }
   ```
3. Regístralo en `js/components.js`:
   ```js
   { name: 'mi-componente', css: true, js: true }
   ```
4. Agrega `<div data-component="mi-componente"></div>` en `index.html` donde deba aparecer.
5. Si es una pista nueva, ponle `class="track tone-…"`, `data-track` y `data-title="…"`
   en su `<section>` y la regla le creará un rombo automáticamente.
