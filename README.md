# Mobiprix Outlet

Web d'outlet de Mobiprix: peces úniques de mobiliari que es reserven aquí i es
recullen a la botiga. Sense pagament en línia i sense enviaments.

**Astro estàtic.** Català per defecte a l'arrel, castellà sota `/es`.

> ## Demo de presentació
>
> El contingut —peces, preus, adreces, telèfons i defectes— és **fictici**, i
> **cap servei extern està connectat**: ni Notion, ni Resend, ni Tally, ni
> analítica, ni mapes. La reserva i els avisos són maquetes: no envien res ni
> desen res.
>
> No és la versió de producció.

## Posar-lo en marxa

```bash
npm install
npm run dev       # servidor de desenvolupament
npm run build     # genera dist/
npm run preview   # serveix dist/
```

## Com canviar el contingut

**Si un text es veu a la pantalla, surt d'un d'aquests llocs.** No hi ha res
escrit a mà dins dels components, perquè el commutador d'idioma ho ha de poder
traduir tot.

| Què | On |
|---|---|
| Interfície (menú, filtres, botons, peu, FAQ, legals…) | `src/i18n/ca.json` i `src/i18n/es.json` |
| Peces | `src/data/productes.json` |
| Botigues | `src/data/botigues.json` |
| Categories | `src/data/categories.json` |
| Fotos | `public/img/` |

Els dos fitxers d'idioma han de tenir **exactament les mateixes claus**. Una
clau que falti atura el `build` en comptes de deixar que surti el nom de la
clau a la pantalla durant la presentació.

### Afegir una peça

Una entrada nova a `src/data/productes.json`. Els camps que costen més:

- **`motiu`** — per què la peça és a l'Outlet: `liquidacio`, `oferta`,
  `exposicio` o `tara`. És la classificació principal.
- **`nota`** — una línia sobre aquesta unitat concreta. És el que es llegeix a
  la targeta quan la peça no té cap defecte.
- **`tara`** — **opcional**. Només les peces que tenen un defecte real, i només
  cal escriure què té: **no hi ha escala de gravetat**. Si el `motiu` és `tara`,
  aquest camp és obligatori i el `build` ho comprova.
- **`mides`** — en números separats (`ample`, `alt`, `fons`), perquè els
  filtres necessiten el número solt.
- **`material` i `color`** — porten `clau` (per agrupar al filtre) i `text`
  (traduït, que és el que es veu).

Un preu outlet superior a l'original també atura el `build`.

### Afegir categories

Els sofàs, armaris i matalassos són les úniques categories perquè són les que
tenen fotografia real. Afegir-ne més és deixar les fotos a `public/img/` i
afegir entrades a `categories.json` i `productes.json`. **No cal tocar codi.**

### Fotos

Si en falta una, la targeta ensenya un marcador amb la referència i el nom en
comptes de la creu del navegador. Tornar a deixar el fitxer amb el nom que diu
el JSON la restitueix.

Les fotos actuals venen de la V1 i **pesen massa** (unes 250 KB cadascuna, a
1500 px, quan es veuen a menys de 600). Per a producció s'han de redimensionar
i recomprimir.

## Estructura

```
src/
├── content.config.ts     Esquema de dades (Content Layer)
├── data/                 El contingut, en JSON
├── i18n/                 Textos i utilitats de traducció
├── lib/
│   ├── productes.ts      Càrrega del catàleg, estalvi, facetes, ordenacions
│   ├── rutes.ts          Mapa de rutes localitzades
│   └── reserves.ts       A quin correu aniria cada reserva
├── styles/
│   ├── tokens.css        Colors, formes i tipografia. Re-tematitzar és tocar això
│   └── global.css        La resta
├── components/           Peces reutilitzables
├── layouts/Base.astro
├── scripts/              JavaScript de client (catàleg, reserva, avisos)
└── pages/                Català a l'arrel, castellà sota es/
```

## Decisions que convé no desfer sense saber-ho

- **El vel del hero està calibrat mesurant contrast real**, no posat a ull. Si
  es canvia la foto cal tornar a mesurar. El pitjor cas actual són 7,79:1 sobre
  18 amplades. La mesura s'ha de fer sobre els rectangles de línia del text, no
  sobre la caixa del bloc: un `<h1>` ocupa tot el contenidor i inclou el buit de
  la dreta, cosa que dóna lectures falses que no corresponen a cap lletra.
- **El logo va a `height: 36px`** pel aire que té el seu viewBox. Si se
  substitueix el fitxer cal remesurar, no reutilitzar el número.
- **El catàleg no fa servir cap framework ni hidratació.** Les targetes surten
  pintades del build i el script només amaga, reordena i compta. Sense
  JavaScript segueix sent un llistat complet ordenat per novetats.
- **L'ordenació aplica `order`** amb posicions calculades al servidor: no mou
  nodes ni perd el focus.
- **El descompte surt en un sol lloc de cada pantalla**, i només com a
  percentatge. Ensenyar-lo alhora en euros i en percentatge, o repetir-lo en un
  bloc comparatiu, era dir dues vegades el mateix.
- **A la fitxa, el botó de reservar va just sota el preu.** És el que ha vingut
  a fer qui obre la fitxa i no pot demanar scroll; la suite ho comprova a tres
  mides de pantalla.
- **«Avisa'm» és un popup d'un sol camp, no una pàgina.** No s'obre sol: un
  popup que salta a la cara durant una presentació és pitjor que no tenir-lo.

## Què queda pendent

| Pendent | On es toca |
|---|---|
| Migrar el contingut a Notion | Substituir el `loader` a `src/content.config.ts`. L'esquema i els components no es toquen |
| Correus per botiga | `src/lib/reserves.ts`. Avui totes comparteixen contacte |
| Enviament real de reserves i avisos | `src/scripts/reserva.ts` i `src/scripts/avisos.ts` |
| Recollir preferències als avisos (categoria, preu…) | Avui només es demana el correu, a `src/components/AvisModal.astro` |
| Analítica | `src/components/Analitica.astro`, buit a propòsit |
| Textos legals | Els han de redactar i revisar. Les pàgines són marcadors amb l'índex del que hi ha d'anar |
| Condicions de reserva | Marcades com a provisionals a tot el lloc |
| Manual de marca | `src/styles/tokens.css`. El verd de la interfície (`#29b12d`) no és el del logo (`#00b33f`) i està pendent de decidir |
| Domini definitiu | Variable `PUBLIC_SITE_URL` |
| `noindex` | A `src/components/SEO.astro`. S'ha de treure quan deixi de ser una demo |
