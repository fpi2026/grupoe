// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import preact from '@astrojs/preact';

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
    // three.js (mapa del Trifinio) pesa ~560 KB, pero se carga aparte y solo
    // cuando el mapa se acerca a la pantalla.
    build: { chunkSizeWarningLimit: 700 },
  },

  integrations: [preact()],
});