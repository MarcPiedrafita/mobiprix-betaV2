// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Demo de presentación: estático puro. Cloudflare Pages sirve dist/ tal cual,
// así que no hace falta adaptador ni runtime de servidor.
export default defineConfig({
  site: 'https://mobiprix-outlet.pages.dev',
  output: 'static',
  trailingSlash: 'ignore',

  // El conmutador de idioma no usa el enrutado i18n de Astro: las rutas se
  // localizan por nombre de fichero (/com-funciona vs /es/como-funciona), que
  // con dos idiomas es más legible. Esto queda declarado para que integraciones
  // como el sitemap sepan qué idiomas hay.
  i18n: {
    defaultLocale: 'ca',
    locales: ['ca', 'es'],
    routing: { prefixDefaultLocale: false },
  },

  integrations: [sitemap()],

  build: { inlineStylesheets: 'auto' },
});
