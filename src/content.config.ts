import { defineCollection, reference, z } from 'astro:content';
import { file } from 'astro/loaders';

/* ==========================================================================
   Fuente de datos
   --------------------------------------------------------------------------
   Hoy: ficheros JSON locales, con la misma forma que tenía data/productos.json
   en la V1, para que quien ya editaba aquel contenido no tenga que reaprender
   nada.

   Mañana: Notion. Migrar es sustituir el `loader` de cada colección por un
   loader de Notion que devuelva objetos con estas mismas claves. El esquema y
   todos los componentes se quedan como están — ese es el motivo de que los
   datos entren por el Content Layer y no por un import directo.
   ========================================================================== */

/** Todo texto que ve el usuario existe en los dos idiomas. Sin excepciones. */
const bilingue = z.object({
  ca: z.string(),
  es: z.string(),
});

/** Topónimos y cifras no se traducen: a veces el valor es uno y basta. */
const bilingueOTexto = z.union([bilingue, z.string()]);

const categories = defineCollection({
  loader: file('src/data/categories.json'),
  schema: z.object({
    ordre: z.number().int(),
    nom: bilingue,
  }),
});

const botigues = defineCollection({
  loader: file('src/data/botigues.json'),
  schema: z.object({
    /* Los nombres de tienda son topónimos: no se traducen. */
    nom: z.string(),
    adreca: z.string(),
    poblacio: z.string(),
    codiPostal: z.string(),
    provincia: z.string(),
    telefon: z.string(),
    coordenades: z.object({ lat: z.number(), lng: z.number() }),
    horari: z.array(
      z.object({
        dies: bilingue,
        hores: bilingueOTexto,
      })
    ),
  }),
});

const productes = defineCollection({
  loader: file('src/data/productes.json'),
  schema: z.object({
    /* Referencia visible en tienda. El id de la colección es el slug. */
    ref: z.string(),
    nom: bilingue,

    categoria: reference('categories'),
    botiga: reference('botigues'),

    preuOriginal: z.number().positive(),
    preuOutlet: z.number().positive(),

    /* En centímetros y por separado, no como la cadena "280 × 165 × 85 cm"
       de la V1: hace falta el número suelto para poder filtrar por medida. */
    mides: z.object({
      ample: z.number().positive(),
      alt: z.number().positive(),
      fons: z.number().positive(),
    }),

    /* `clau` normaliza el valor para agrupar en los filtros; `text` es lo que
       se enseña, traducido. Dos productos con el mismo tejido comparten clave
       aunque el texto cambie de idioma. */
    material: z.object({ clau: z.string(), text: bilingue }),
    color: z.object({ clau: z.string(), text: bilingue }),

    /* Por qué esta pieza está en el Outlet. La mayoría entran por fin de serie
       o por campaña: tener un defecto es el caso menos frecuente, así que no
       puede ser una propiedad obligatoria de todos los productos. */
    motiu: z.enum(['liquidacio', 'oferta', 'exposicio', 'tara']),

    /* Una línea sobre esta unidad concreta: por qué está aquí. Es lo que se
       lee en la tarjeta cuando la pieza no tiene ningún defecto. */
    nota: bilingue,

    /* Sólo cuando hay un defecto real que declarar. Ausente en la mayoría de
       piezas. `punt` marca dónde está sobre la foto, en % — mientras no haya
       fotos específicas de cada tara se reutiliza la del producto y se señala
       la zona. */
    tara: z
      .object({
        nivell: z.enum(['lleu', 'mitjana', 'notable']),
        descripcio: bilingue,
        foto: z.object({
          imatge: z.string(),
          punt: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }),
        }),
      })
      .optional(),

    descripcio: bilingue,

    galeria: z.array(z.string()).min(1),

    estat: z.enum(['disponible', 'reservat', 'exhaurit']),
    badges: z.array(z.enum(['ultima-unitat', 'novetat', 'rebaixa'])).default([]),
    dataAlta: z.coerce.date(),
  })
    /* Un precio outlet por encima del original sería un error de contenido que
       se vería en la web como un ahorro negativo. Mejor que falle el build. */
    .refine((p) => p.preuOutlet < p.preuOriginal, {
      message: 'El preu outlet ha de ser inferior al preu original',
      path: ['preuOutlet'],
    })
    /* Si el motivo es la tara, el defecto tiene que estar descrito: es
       justamente lo que se está vendiendo. Al revés sí vale — una unidad de
       exposición puede tener una marca sin que sea el motivo principal. */
    .refine((p) => p.motiu !== 'tara' || p.tara !== undefined, {
      message: "Amb motiu 'tara' cal descriure el defecte al camp `tara`",
      path: ['tara'],
    }),
});

export const collections = { productes, botigues, categories };
