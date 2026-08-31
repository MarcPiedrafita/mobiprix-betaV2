/* ==========================================================================
   Filtres, cerca i ordenació del catàleg
   --------------------------------------------------------------------------
   Vanilla, sense framework ni hidratació: les targetes ja venen pintades del
   build, amb els seus atributs data-*, i aquí només s'amaguen, es reordenen i
   es compta. Si el JavaScript no arrenca, el catàleg segueix sent un llistat
   complet i ordenat per novetats — que és l'ordre en què surten del build.

   L'ordenació no mou nodes: cada targeta porta la seva posició en cada criteri
   calculada al servidor i aquí només s'aplica `order`. Així no es perd el focus
   ni salta res en canviar de criteri.

   El camp de cerca viu a la capçalera i és un <form> cap al catàleg. Aquí
   s'intercepta l'enviament per filtrar en viu, i es llegeix ?q= en entrar,
   de manera que una cerca es pot enllaçar i compartir.
   ========================================================================== */

const TOTS = 'tots';

const CRITERIS = ['novetats', 'preuAsc', 'preuDesc', 'estalvi'] as const;
type Criteri = (typeof CRITERIS)[number];

const esCriteri = (valor: string): valor is Criteri =>
  (CRITERIS as readonly string[]).includes(valor);

/** Ha de coincidir amb la de src/lib/productes.ts: el text de `data-cerca` ja
 *  ve normalitzat del build i la consulta s'ha de normalitzar igual. */
const normalitza = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

type Filtre = {
  categoria: string;
  botiga: string;
  preuMin: number | null;
  preuMax: number | null;
  motiu: string;
  material: string;
  color: string;
  ampleMax: number | null;
  altMax: number | null;
  nomesDisponibles: boolean;
  cerca: string;
  ordre: Criteri;
};

function iniciar(): void {
  const panell = document.querySelector<HTMLElement>('[data-filtros]');
  const rejilla = document.querySelector<HTMLElement>('[data-rejilla]');
  const buit = document.querySelector<HTMLElement>('[data-buit]');
  const recompte = document.querySelector<HTMLElement>('[data-recompte]');
  if (!panell || !rejilla || !buit || !recompte) return;

  const targetes = Array.from(rejilla.querySelectorAll<HTMLElement>('[data-producte]'));

  /* Les posicions d'ordenació es llegeixen un sol cop: no canvien mai. */
  const ordres = new Map<HTMLElement, Record<Criteri, number>>(
    targetes.map((t) => [t, JSON.parse(t.dataset.ordre ?? '{}') as Record<Criteri, number>])
  );

  const camp = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

  const cerca = camp<HTMLInputElement>('cerca-global');
  const botiga = camp<HTMLSelectElement>('f-botiga');
  const preuMin = camp<HTMLInputElement>('f-preu-min');
  const preuMax = camp<HTMLInputElement>('f-preu-max');
  const motiu = camp<HTMLSelectElement>('f-motiu');
  const material = camp<HTMLSelectElement>('f-material');
  const color = camp<HTMLSelectElement>('f-color');
  const ample = camp<HTMLInputElement>('f-ample');
  const alt = camp<HTMLInputElement>('f-alt');
  const disponibles = camp<HTMLInputElement>('f-disponibles');
  const ordre = camp<HTMLSelectElement>('f-ordre');

  const formCerca = document.querySelector<HTMLFormElement>('[data-busca]');
  const avancats = document.querySelector<HTMLElement>('[data-desplega]');
  const panellAvancats = document.getElementById('filtres-avancats');
  const compteFiltres = document.querySelector<HTMLElement>('[data-compte-filtres]');
  const fitxaCerca = document.querySelector<HTMLElement>('[data-fitxa-cerca]');
  const fitxaCercaText = document.querySelector<HTMLElement>('[data-fitxa-cerca-text]');

  const pills = Array.from(panell.querySelectorAll<HTMLButtonElement>('[data-categoria]'));

  /** Un camp numèric buit o il·legible no filtra: val més ensenyar-ho tot que
   *  amagar-ho tot mentre algú escriu. */
  const numeroDe = (input: HTMLInputElement | null): number | null => {
    if (!input || input.value.trim() === '') return null;
    const valor = Number(input.value);
    return Number.isFinite(valor) ? valor : null;
  };

  const categoriaActiva = () =>
    pills.find((p) => p.getAttribute('aria-pressed') === 'true')?.dataset.categoria ?? TOTS;

  const llegeix = (): Filtre => ({
    categoria: categoriaActiva(),
    botiga: botiga?.value ?? TOTS,
    preuMin: numeroDe(preuMin),
    preuMax: numeroDe(preuMax),
    motiu: motiu?.value ?? TOTS,
    material: material?.value ?? TOTS,
    color: color?.value ?? TOTS,
    ampleMax: numeroDe(ample),
    altMax: numeroDe(alt),
    nomesDisponibles: disponibles?.checked ?? false,
    cerca: normalitza(cerca?.value.trim() ?? ''),
    ordre: ordre && esCriteri(ordre.value) ? ordre.value : 'novetats',
  });

  const compleix = (targeta: HTMLElement, f: Filtre): boolean => {
    const d = targeta.dataset;

    if (f.categoria !== TOTS && d.categoria !== f.categoria) return false;
    if (f.botiga !== TOTS && d.botiga !== f.botiga) return false;
    if (f.motiu !== TOTS && d.motiu !== f.motiu) return false;
    if (f.material !== TOTS && d.material !== f.material) return false;
    if (f.color !== TOTS && d.color !== f.color) return false;

    /* Reservat i venut segueixen a la graella, atenuats: només desapareixen si
       algú demana expressament veure'n només els disponibles. */
    if (f.nomesDisponibles && d.estat !== 'disponible') return false;

    const preu = Number(d.preu);
    if (f.preuMin !== null && preu < f.preuMin) return false;
    if (f.preuMax !== null && preu > f.preuMax) return false;

    if (f.ampleMax !== null && Number(d.ample) > f.ampleMax) return false;
    if (f.altMax !== null && Number(d.alt) > f.altMax) return false;

    if (f.cerca && !(d.cerca ?? '').includes(f.cerca)) return false;

    return true;
  };

  const textRecompte = (n: number): string => {
    const un = recompte.dataset.textUn ?? '1';
    const varis = recompte.dataset.textVaris ?? '{n}';
    return n === 1 ? un : varis.split('{n}').join(String(n));
  };

  /** Quants filtres avançats estan tocats. Va al comptador del desplegable
   *  perquè no quedi cap filtre actiu amagat sense avisar. */
  const compteAvancats = (f: Filtre): number =>
    [
      f.preuMin !== null,
      f.preuMax !== null,
      f.motiu !== TOTS,
      f.material !== TOTS,
      f.color !== TOTS,
      f.ampleMax !== null,
      f.altMax !== null,
      f.nomesDisponibles,
    ].filter(Boolean).length;

  const aplica = (): void => {
    const f = llegeix();
    let visibles = 0;

    for (const targeta of targetes) {
      const passa = compleix(targeta, f);
      targeta.hidden = !passa;
      if (passa) visibles += 1;

      const posicions = ordres.get(targeta);
      if (posicions) targeta.style.order = String(posicions[f.ordre] ?? 0);
    }

    /* Hi ha combinacions que donen zero: cal estat buit, no una graella muda. */
    rejilla.hidden = visibles === 0;
    buit.hidden = visibles > 0;
    recompte.textContent = textRecompte(visibles);

    const actius = compteAvancats(f);
    if (compteFiltres) {
      compteFiltres.textContent = String(actius);
      compteFiltres.hidden = actius === 0;
    }

    formCerca?.classList.toggle('busca--plena', (cerca?.value ?? '') !== '');
    if (fitxaCerca && fitxaCercaText) {
      const consulta = cerca?.value.trim() ?? '';
      fitxaCercaText.textContent = consulta ? `«${consulta}»` : '';
      fitxaCerca.hidden = consulta === '';
    }
  };

  /* --------------------------------------------------------------- Events -- */

  for (const pill of pills) {
    pill.addEventListener('click', () => {
      for (const altre of pills) {
        altre.setAttribute('aria-pressed', String(altre === pill));
      }
      aplica();
    });
  }

  for (const control of [botiga, motiu, material, color, ordre, disponibles]) {
    control?.addEventListener('change', aplica);
  }

  for (const control of [cerca, preuMin, preuMax, ample, alt]) {
    control?.addEventListener('input', aplica);
  }

  /* Al catàleg la cerca filtra en viu; enviar el formulari recarregaria la
     pàgina per res. Fora del catàleg no hi ha aquest script i el <form> fa la
     seva feina: portar-hi amb ?q=. */
  formCerca?.addEventListener('submit', (e) => {
    e.preventDefault();
    aplica();
  });

  for (const boto of document.querySelectorAll('[data-esborra-cerca]')) {
    boto.addEventListener('click', () => {
      if (!cerca) return;
      cerca.value = '';
      cerca.focus();
      aplica();
    });
  }

  /* Desplegable dels filtres avançats. */
  if (avancats && panellAvancats) {
    avancats.addEventListener('click', () => {
      const obert = avancats.getAttribute('aria-expanded') === 'true';
      avancats.setAttribute('aria-expanded', String(!obert));
      panellAvancats.hidden = obert;

      const etiqueta = avancats.querySelector<HTMLElement>('[data-desplega-text]');
      if (etiqueta) {
        etiqueta.textContent = obert
          ? (avancats.dataset.textMes ?? '')
          : (avancats.dataset.textMenys ?? '');
      }
    });
  }

  const neteja = (): void => {
    pills.forEach((p, i) => p.setAttribute('aria-pressed', String(i === 0)));
    for (const control of [botiga, motiu, material, color]) {
      if (control) control.value = TOTS;
    }
    for (const control of [cerca, preuMin, preuMax, ample, alt]) {
      if (control) control.value = '';
    }
    if (disponibles) disponibles.checked = false;
    if (ordre) ordre.value = 'novetats';
    aplica();
  };

  for (const boto of document.querySelectorAll('[data-neteja]')) {
    boto.addEventListener('click', neteja);
  }

  /* Una cerca que arriba per URL (?q=) omple el camp i, si ve de fora, deixa
     el desplegable com estigui: només és cerca, no filtre avançat. */
  const consultaUrl = new URLSearchParams(window.location.search).get('q');
  if (consultaUrl && cerca) cerca.value = consultaUrl;

  aplica();
}

iniciar();

/* Sense cap import, TypeScript tractaria el fitxer com un script global i
   les seves declaracions xocarien amb les dels altres scripts. Això el fa
   mòdul i li dona àmbit propi. */
export {};
