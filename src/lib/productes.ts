import { getCollection, type CollectionEntry } from 'astro:content';
import { IDIOMES, type Idioma } from '../i18n/utils';

export type Producte = CollectionEntry<'productes'>;
export type Botiga = CollectionEntry<'botigues'>;
export type Categoria = CollectionEntry<'categories'>;

export const CRITERIS_ORDRE = ['novetats', 'preuAsc', 'preuDesc', 'estalvi'] as const;
export type CriteriOrdre = (typeof CRITERIS_ORDRE)[number];

/* Per què la peça és a l'Outlet. L'ordre és el que surt al desplegable. */
export const MOTIUS = ['liquidacio', 'oferta', 'exposicio', 'tara'] as const;
export type Motiu = (typeof MOTIUS)[number];

/** Escala del defecte, quan n'hi ha. La majoria de peces no en tenen. */
export const NIVELLS_TARA = ['lleu', 'mitjana', 'notable'] as const;

/** Producte amb la botiga i la categoria ja resoltes, l'estalvi calculat i
 *  tot el que necessiten els filtres del client. Les pàgines no han de tornar
 *  a buscar res. */
export type ProducteVista = {
  slug: string;
  dades: Producte['data'];
  botiga: Botiga['data'];
  categoria: Categoria['data'];
  estalvi: number;
  estalviPct: number;
  /** Text ja normalitzat per a la cerca, amb els dos idiomes dins: buscar
   *  "armario" troba l'armari encara que la interfície estigui en català. */
  cerca: string;
  /** Posició en cada ordenació, calculada al build. El client només aplica
   *  `style.order`, no ordena res. */
  ordre: Record<CriteriOrdre, number>;
};

export const estalvi = (d: Producte['data']) => d.preuOriginal - d.preuOutlet;

export const estalviPct = (d: Producte['data']) =>
  Math.round((1 - d.preuOutlet / d.preuOriginal) * 100);

/** Sense accents i en minúscules, perquè "sofà" i "sofa" trobin el mateix. */
export const normalitza = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const textCerca = (
  d: Producte['data'],
  botiga: Botiga['data'],
  categoria: Categoria['data']
) =>
  normalitza(
    [
      d.ref,
      ...IDIOMES.map((i) => d.nom[i]),
      ...IDIOMES.map((i) => d.material.text[i]),
      ...IDIOMES.map((i) => d.color.text[i]),
      ...IDIOMES.map((i) => categoria.nom[i]),
      ...IDIOMES.map((i) => d.nota[i]),
      botiga.nom,
      d.motiu,
    ].join(' ')
  );

/* Els comparadors. En tots, el que ja s'ha venut cau al final: segueix al
   catàleg perquè ensenya que l'Outlet es mou, però no ha d'encapçalar-lo. */
const COMPARADORS: Record<CriteriOrdre, (a: ProducteVista, b: ProducteVista) => number> = {
  novetats: (a, b) => b.dades.dataAlta.getTime() - a.dades.dataAlta.getTime(),
  preuAsc: (a, b) => a.dades.preuOutlet - b.dades.preuOutlet,
  preuDesc: (a, b) => b.dades.preuOutlet - a.dades.preuOutlet,
  estalvi: (a, b) => b.estalviPct - a.estalviPct,
};

const pesEstat = (v: ProducteVista) => (v.dades.estat === 'exhaurit' ? 1 : 0);

/**
 * Carrega el catàleg sencer amb les referències resoltes. Una sola passada
 * per les tres col·leccions; les pàgines la criden un cop.
 */
export async function carregaCataleg(): Promise<ProducteVista[]> {
  const [productes, botigues, categories] = await Promise.all([
    getCollection('productes'),
    getCollection('botigues'),
    getCollection('categories'),
  ]);

  const perId = <T extends { id: string }>(llista: T[]) =>
    new Map(llista.map((e) => [e.id, e]));

  const mapaBotigues = perId(botigues);
  const mapaCategories = perId(categories);

  const vistes: ProducteVista[] = productes.map((entrada) => {
    const d = entrada.data;

    const botiga = mapaBotigues.get(d.botiga.id);
    const categoria = mapaCategories.get(d.categoria.id);

    /* Una referència trencada és un error de contingut: millor que peti el
       build que no pas ensenyar una fitxa sense botiga a la presentació. */
    if (!botiga) throw new Error(`[dades] el producte "${entrada.id}" apunta a la botiga inexistent "${d.botiga.id}"`);
    if (!categoria) throw new Error(`[dades] el producte "${entrada.id}" apunta a la categoria inexistent "${d.categoria.id}"`);

    return {
      slug: entrada.id,
      dades: d,
      botiga: botiga.data,
      categoria: categoria.data,
      estalvi: estalvi(d),
      estalviPct: estalviPct(d),
      cerca: textCerca(d, botiga.data, categoria.data),
      ordre: {} as Record<CriteriOrdre, number>,
    };
  });

  for (const criteri of CRITERIS_ORDRE) {
    [...vistes]
      .sort((a, b) => pesEstat(a) - pesEstat(b) || COMPARADORS[criteri](a, b))
      .forEach((v, posicio) => {
        v.ordre[criteri] = posicio;
      });
  }

  /* L'ordre del DOM és el de "novetats", que és el criteri per defecte: així
   * el catàleg ja surt ben ordenat encara que el JavaScript no arrenqui. */
  return vistes.sort((a, b) => a.ordre.novetats - b.ordre.novetats);
}

/** Valors realment presents al catàleg, per no oferir filtres buits. */
export function facetes(cataleg: ProducteVista[], idioma: Idioma) {
  const unics = <T>(llista: T[], clau: (v: T) => string) => {
    const mapa = new Map<string, T>();
    for (const v of llista) if (!mapa.has(clau(v))) mapa.set(clau(v), v);
    return [...mapa.values()];
  };

  const materials = unics(
    cataleg.map((v) => v.dades.material),
    (m) => m.clau
  ).sort((a, b) => a.text[idioma].localeCompare(b.text[idioma], idioma));

  const colors = unics(
    cataleg.map((v) => v.dades.color),
    (c) => c.clau
  ).sort((a, b) => a.text[idioma].localeCompare(b.text[idioma], idioma));

  const preus = cataleg.map((v) => v.dades.preuOutlet);

  return {
    materials,
    colors,
    preuMin: Math.floor(Math.min(...preus) / 10) * 10,
    preuMax: Math.ceil(Math.max(...preus) / 10) * 10,
  };
}

/** Categories ordenades pel camp `ordre`, per als pills del filtre. */
export async function carregaCategories() {
  const categories = await getCollection('categories');
  return categories.sort((a, b) => a.data.ordre - b.data.ordre);
}

export async function carregaBotigues() {
  const botigues = await getCollection('botigues');
  return botigues.sort((a, b) => a.data.nom.localeCompare(b.data.nom, 'ca'));
}
