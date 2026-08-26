import ca from './ca.json';
import es from './es.json';

export const IDIOMES = ['ca', 'es'] as const;
export type Idioma = (typeof IDIOMES)[number];

/** El brief ho diu clar: català per defecte. La V1 tenia castellà. */
export const IDIOMA_PER_DEFECTE: Idioma = 'ca';

const DICCIONARIS = { ca, es } as const;

/** Camins de clau vàlids, derivats del diccionari català. Una clau mal escrita
 *  no compila, així que no pot arribar a la demo com a text cru en pantalla. */
type Fulles<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : Fulles<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type ClauText = Fulles<typeof ca>;

export type Variables = Record<string, string | number>;

/**
 * t('ca', 'filtres.resultatsVaris', { n: 12 })
 *
 * A diferència de la V1, que avisava per consola i pintava la clau, aquí una
 * clau que falta atura el build: en una demo de venda no pot sortir mai un
 * "filtres.resultatsVaris" a la pantalla.
 */
export function t(idioma: Idioma, clau: ClauText, vars?: Variables): string {
  const valor = clau
    .split('.')
    .reduce<unknown>(
      (obj, part) => (obj == null ? undefined : (obj as Record<string, unknown>)[part]),
      DICCIONARIS[idioma]
    );

  if (typeof valor !== 'string') {
    throw new Error(`[i18n] falta la clau "${clau}" a "${idioma}"`);
  }
  if (!vars) return valor;

  return Object.entries(vars).reduce(
    (text, [nom, substitut]) => text.split(`{${nom}}`).join(String(substitut)),
    valor
  );
}

/** Versió lligada a un idioma, per no repetir-lo a cada crida dins d'una pàgina. */
export function traductor(idioma: Idioma) {
  return (clau: ClauText, vars?: Variables) => t(idioma, clau, vars);
}

export type Traductor = ReturnType<typeof traductor>;

/** Text que pot venir traduït o ser un valor únic (topònims, horaris). */
export function bilingue(valor: string | Record<Idioma, string>, idioma: Idioma): string {
  return typeof valor === 'string' ? valor : valor[idioma];
}

/* useGrouping:'always' perquè es-ES i ca-ES ometen el separador en xifres de
   quatre dígits (1370 en comptes de 1.370) i en un preu el volem sempre. */
const FORMATADORS: Record<Idioma, Intl.NumberFormat> = {
  ca: new Intl.NumberFormat('ca-ES', { useGrouping: 'always' }),
  es: new Intl.NumberFormat('es-ES', { useGrouping: 'always' }),
};

export const numero = (n: number, idioma: Idioma) => FORMATADORS[idioma].format(n);
export const preu = (n: number, idioma: Idioma) => `${FORMATADORS[idioma].format(n)} €`;
