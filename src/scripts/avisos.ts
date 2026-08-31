/* ==========================================================================
   Avisos «avisa'm quan entri alguna cosa així»
   --------------------------------------------------------------------------
   Simulat de dalt a baix: no hi ha persistència ni s'envia cap correu. És la
   funcionalitat que justifica el tram alt del pressupost, així que ha de
   veure's creïble, però per dins és maqueta i la confirmació ho diu.

   Per connectar-ho de debò: substituir el cos de `desa()` per la crida que
   toqui i deixar el canvi de pantalla per quan resolgui. El resum del que se
   segueix ja es construeix aquí i és el que hauria de viatjar.
   ========================================================================== */

const TOTS = 'tots';

/** Omple una plantilla del tipus "Text {clau} text". */
const omple = (plantilla: string, valors: Record<string, string>): string =>
  Object.entries(valors).reduce(
    (text, [clau, valor]) => text.split(`{${clau}}`).join(valor),
    plantilla
  );

function iniciar(): void {
  const arrel = document.querySelector<HTMLElement>('[data-avis]');
  const formulari = document.querySelector<HTMLFormElement>('[data-formulari-avis]');
  const pantallaForm = document.querySelector<HTMLElement>('[data-avis-form]');
  const pantallaOk = document.querySelector<HTMLElement>('[data-avis-ok]');
  const sortidaText = document.querySelector<HTMLElement>('[data-avis-text]');
  const sortidaResum = document.querySelector<HTMLElement>('[data-avis-resum]');
  if (!arrel || !formulari || !pantallaForm || !pantallaOk || !sortidaText || !sortidaResum) return;

  const camp = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;
  const categoria = camp<HTMLSelectElement>('a-categoria');
  const botiga = camp<HTMLSelectElement>('a-botiga');
  const preu = camp<HTMLInputElement>('a-preu');
  const email = camp<HTMLInputElement>('a-email');

  /** El text de "estàs seguint: …", amb el nom visible de cada tria. */
  const resum = (): string => {
    const trossos: string[] = [];

    const etiqueta = (select: HTMLSelectElement | null): string | null => {
      if (!select || select.value === TOTS) return null;
      return select.options[select.selectedIndex]?.text ?? null;
    };

    const cat = etiqueta(categoria);
    const bot = etiqueta(botiga);
    if (cat) trossos.push(cat);
    if (bot) trossos.push(bot);

    const maxim = preu?.value.trim();
    if (maxim) {
      trossos.push(omple(sortidaResum.dataset.fins ?? '{n}', { n: maxim }));
    }

    return trossos.length ? trossos.join(' · ') : (sortidaResum.dataset.tot ?? '');
  };

  const desa = (): void => {
    /* Aquí aniria la crida real. Avui: ni xarxa, ni emmagatzematge. */
    sortidaText.textContent = omple(sortidaText.dataset.plantilla ?? '', {
      email: email?.value.trim() ?? '',
    });
    sortidaResum.textContent = omple(sortidaResum.dataset.plantilla ?? '', { resum: resum() });

    pantallaForm.hidden = true;
    pantallaOk.hidden = false;
    pantallaOk.setAttribute('tabindex', '-1');
    pantallaOk.focus({ preventScroll: true });
    pantallaOk.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  formulari.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!formulari.checkValidity()) {
      const invalid = formulari.querySelector<HTMLInputElement>(':invalid');
      invalid?.focus();
      invalid?.reportValidity();
      return;
    }
    desa();
  });

  document.querySelector('[data-avis-altre]')?.addEventListener('click', () => {
    formulari.reset();
    pantallaOk.hidden = true;
    pantallaForm.hidden = false;
    email?.focus();
  });
}

iniciar();

/* Sense cap import, TypeScript tractaria el fitxer com un script global i
   les seves declaracions xocarien amb les dels altres scripts. Això el fa
   mòdul i li dona àmbit propi. */
export {};
