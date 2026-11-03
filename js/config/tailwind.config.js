/* Configuración del Play CDN de Tailwind.
   Se carga justo después de cdn.tailwindcss.com, antes de que se inserten los componentes. */
tailwind.config = {
  // Sin preflight: el reset de Tailwind no debe pisar css/base.css
  corePlugins: { preflight: false },

  // Clases que solo aparecen dentro de atributos x-transition de Alpine
  // y que el escáner de Tailwind no detectaría por sí mismo.
  safelist: [
    'transition', 'ease-out', 'ease-in', 'duration-150', 'duration-200', 'duration-300',
    'opacity-0', 'opacity-100', 'scale-90', 'scale-95', 'scale-100',
    '-translate-x-4', 'translate-x-0', 'translate-x-8'
  ],

  theme: {
    extend: {
      keyframes: {
        wobble: {
          '0%,100%': { transform: 'rotate(-6deg)' },
          '50%': { transform: 'rotate(6deg)' }
        }
      },
      animation: {
        wobble: 'wobble 1.1s cubic-bezier(.45,0,.55,1) infinite'
      }
    }
  }
};
