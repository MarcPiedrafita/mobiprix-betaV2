// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Demo de presentación: estático puro. Cloudflare Pages sirve dist/ tal cual,
// así que no hace falta adaptador ni runtime de servidor.
/* La URL pública surt de l'entorn perquè les etiquetes canonical, hreflang i
   og:image apuntin al domini que realment serveix el build. Sense això, un
   desplegament de prova genera og:image cap a un domini que no existeix i el
   enllaç compartit per WhatsApp surt sense previsualització — que és
   justament una de les vies de venda del brief.

   Ordre: variable explícita, després el domini que injecta la plataforma
   (Cloudflare Pages o Vercel), i com a últim recurs el destí previst.
   Quan es tanqui el domini definitiu, es posa a PUBLIC_SITE_URL. */
const dominiPlataforma =
  process.env.CF_PAGES_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined);

const site = process.env.PUBLIC_SITE_URL ?? dominiPlataforma ?? 'https://mobiprix-outlet.pages.dev';

export default defineConfig({
  site,
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
