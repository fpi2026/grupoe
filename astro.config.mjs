// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// Publicación en GitHub Pages de la organización: https://fpi2026.github.io/grupoe/
// SITE_URL y BASE_PATH permiten cambiar el destino (por ejemplo, un dominio propio) sin tocar el código.
const site = process.env.SITE_URL ?? 'https://fpi2026.github.io';
const base = process.env.BASE_PATH ?? '/grupoe';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'ignore',

  // Español en la raíz (/) e inglés en /en/
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});