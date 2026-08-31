import { IDIOMES, type Idioma } from '../i18n/utils';

/* ==========================================================================
   Rutes
   --------------------------------------------------------------------------
   Les URL es localitzen: /com-funciona i /es/como-funciona. Cada pàgina té el
   seu fitxer dins src/pages (català, a l'arrel) i src/pages/es (castellà), i
   totes dues importen el mateix component de contingut, així que el marcatge
   no es duplica.

   Aquest mapa és l'única font de veritat dels enllaços: el menú, el peu, el
   commutador d'idioma i les etiquetes hreflang en surten. Si es canvia una
   ruta es canvia aquí i al nom del fitxer, i prou.
   ========================================================================== */

export const CLAUS_RUTA = [
  'home',
  'outlet',
  'comFunciona',
  'botigues',
  'faq',
  'avisLegal',
  'privacitat',
  'condicions',
] as const;

export type ClauRuta = (typeof CLAUS_RUTA)[number];

const RUTES: Record<ClauRuta, Record<Idioma, string>> = {
  home:        { ca: '/',                         es: '/es/' },
  outlet:      { ca: '/outlet',                   es: '/es/outlet' },
  comFunciona: { ca: '/com-funciona',             es: '/es/como-funciona' },
  botigues:    { ca: '/botigues',                 es: '/es/tiendas' },
  faq:         { ca: '/faq',                      es: '/es/faq' },
  avisLegal:   { ca: '/legal/avis-legal',         es: '/es/legal/aviso-legal' },
  privacitat:  { ca: '/legal/privacitat',         es: '/es/legal/privacidad' },
  condicions:  { ca: '/legal/condicions-reserva', es: '/es/legal/condiciones-reserva' },
};

export const ruta = (clau: ClauRuta, idioma: Idioma) => RUTES[clau][idioma];

export const rutaProducte = (slug: string, idioma: Idioma) =>
  idioma === 'ca' ? `/producte/${slug}` : `/es/producto/${slug}`;

export const rutaReserva = (slug: string, idioma: Idioma) =>
  idioma === 'ca' ? `/reserva/${slug}` : `/es/reserva/${slug}`;

/** Totes les versions idiomàtiques d'una pàgina. Alimenta el commutador
 *  d'idioma (que ha de saltar a la pàgina equivalent, no a la portada) i les
 *  etiquetes hreflang del <head>. */
export type Alternatives = Record<Idioma, string>;

const construeix = (fn: (idioma: Idioma) => string): Alternatives =>
  Object.fromEntries(IDIOMES.map((i) => [i, fn(i)])) as Alternatives;

export const alternativesRuta = (clau: ClauRuta) => construeix((i) => ruta(clau, i));
export const alternativesProducte = (slug: string) => construeix((i) => rutaProducte(slug, i));
export const alternativesReserva = (slug: string) => construeix((i) => rutaReserva(slug, i));

/** Enllaços del menú principal, en ordre. */
/* Avisa'm no hi és: és un popup, no una pàgina. La capçalera l'afegeix com a
   botó després d'aquests enllaços. */
export const MENU: ClauRuta[] = ['outlet', 'comFunciona', 'botigues', 'faq'];

/** Enllaços legals del peu, en ordre. */
export const MENU_LEGAL: ClauRuta[] = ['avisLegal', 'privacitat', 'condicions'];
