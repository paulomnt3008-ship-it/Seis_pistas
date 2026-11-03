const EXIT_MS = 260; // un poco más que la transición de salida (200 ms)

const INITIAL_TASKS = [
  'Revisar transiciones de la tabla',
  'Animar estado de carga',
  'Probar con prefers-reduced-motion'
];

/** Estado y métodos del componente <div x-data="tareas">. */
function tareas() {
  return {
    draft: '',
    open: true,
    nextId: INITIAL_TASKS.length + 1,
    items: INITIAL_TASKS.map((text, i) => ({ id: i + 1, text, shown: true })),

    // Alpine no anima la inserción en x-for: el elemento nace oculto
    // y se muestra en el siguiente tick para disparar x-transition.
    add() {
      const text = this.draft.trim();
      if (!text) return;
      const id = this.nextId++;
      this.items.push({ id, text, shown: false });
      this.draft = '';
      this.$nextTick(() => { this.items.find((item) => item.id === id).shown = true; });
    },

    // Primero se oculta (transición de salida) y después se elimina.
    remove(id) {
      this.items.find((item) => item.id === id).shown = false;
      setTimeout(() => { this.items = this.items.filter((item) => item.id !== id); }, EXIT_MS);
    }
  };
}

/** Registra el componente antes de que Alpine arranque (js/main.js lo carga después). */
export function init() {
  document.addEventListener('alpine:init', () => {
    window.Alpine.data('tareas', tareas);
  });
}
