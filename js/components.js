/* Registro de componentes, en el orden en que se montan.
   Cada uno vive en components/<name>/ y puede tener:
     <name>.html  (obligatorio) marcado con un solo elemento raíz
     <name>.css   (si css: true)
     <name>.js    (si js: true) un módulo que exporta init(root)            */
export const components = [
  { name: 'ruler',          css: true, js: true  },
  { name: 'hero',           css: true, js: true  },
  { name: 'track-css',      css: true, js: true  },
  { name: 'track-tailwind', css: true, js: false },
  { name: 'track-gsap',     css: true, js: true  },
  { name: 'track-anime',    css: true, js: true  },
  { name: 'track-three',    css: true, js: true  },
  { name: 'track-alpine',   css: true, js: true  },
  { name: 'footer',         css: true, js: false },
  { name: 'tai-button',     css: true, js: true  }
];
