/* ==========================================================================
   Enrutado de las reservas por tienda
   --------------------------------------------------------------------------
   HOY: no existen correos por tienda. Las 18 tiendas comparten un único
   contacto, así que todas las entradas apuntan al mismo sitio. Esto NO está
   conectado a nada: la demo no envía correo, sólo enseña a dónde iría.

   MAÑANA: cuando cada tienda tenga su buzón, se cambian los valores de este
   objeto y ya está. Ni los componentes ni las páginas se tocan — por eso el
   destino se resuelve aquí y no en la plantilla de la confirmación.

   El día que se conecte Resend, este mapa es lo que alimenta el `to` del
   correo transaccional.
   ========================================================================== */

/** Contacto único mientras no haya buzón por tienda. Es de ejemplo: no es una
 *  dirección real y la demo no envía nada. */
const CONTACTE_COMPARTIT = 'outlet@exemple.mobiprix.com';

const CORREUS_PER_BOTIGA: Record<string, string> = {
  barbera: CONTACTE_COMPARTIT,
  'sant-cugat': CONTACTE_COMPARTIT,
  sabadell: CONTACTE_COMPARTIT,
  mataro: CONTACTE_COMPARTIT,
};

/** A dónde iría el aviso de esta reserva. La confirmación lo enseña: es lo que
 *  hace creíble la maqueta y deja ver que el enrutado está previsto. */
export const destiReserva = (idBotiga: string): string =>
  CORREUS_PER_BOTIGA[idBotiga] ?? CONTACTE_COMPARTIT;

/** True mientras todas las tiendas compartan buzón. Sirve para avisar en la
 *  demo de que el enrutado por tienda está montado pero todavía no diferencia. */
export const enrutatPerBotigaActiu = (): boolean =>
  new Set(Object.values(CORREUS_PER_BOTIGA)).size > 1;
