/* ==========================================================================
   Popup «vols que t'avisem?»
   --------------------------------------------------------------------------
   Un sol camp: el correu. Simulat de dalt a baix — ni persistència ni enviament
   — i la confirmació ho diu.

   Per connectar-ho: substituir el cos de `desa()` per la crida que toqui i
   deixar el canvi de pantalla per quan resolgui.
   ========================================================================== */

const omple = (plantilla: string, valors: Record<string, string>): string =>
  Object.entries(valors).reduce(
    (text, [clau, valor]) => text.split(`{${clau}}`).join(valor),
    plantilla
  );

function iniciar(): void {
  const modal = document.querySelector<HTMLDialogElement>('[data-avis-modal]');
  const formulari = document.querySelector<HTMLFormElement>('[data-formulari-avis]');
  const pantallaForm = document.querySelector<HTMLElement>('[data-avis-form]');
  const pantallaOk = document.querySelector<HTMLElement>('[data-avis-ok]');
  const sortida = document.querySelector<HTMLElement>('[data-avis-text]');
  if (!modal || !formulari || !pantallaForm || !pantallaOk || !sortida) return;

  const email = document.getElementById('avis-email') as HTMLInputElement | null;

  const reinicia = (): void => {
    formulari.reset();
    pantallaOk.hidden = true;
    pantallaForm.hidden = false;
  };

  /* Qualsevol botó del web amb data-avis-obre obre el popup. */
  for (const disparador of document.querySelectorAll('[data-avis-obre]')) {
    disparador.addEventListener('click', (e) => {
      e.preventDefault();
      reinicia();
      modal.showModal();
      email?.focus();
    });
  }

  for (const boto of modal.querySelectorAll('[data-avis-tanca]')) {
    boto.addEventListener('click', () => modal.close());
  }

  /* Clic al fons fosc, fora del panell. */
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });

  formulari.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!formulari.checkValidity()) {
      email?.reportValidity();
      return;
    }

    /* Aquí aniria la crida real. Avui: ni xarxa, ni emmagatzematge. */
    sortida.textContent = omple(sortida.dataset.plantilla ?? '', {
      email: email?.value.trim() ?? '',
    });
    pantallaForm.hidden = true;
    pantallaOk.hidden = false;
  });
}

iniciar();

/* Sense cap import, TypeScript tractaria el fitxer com un script global i
   les seves declaracions xocarien amb les dels altres scripts. Això el fa
   mòdul i li dona àmbit propi. */
export {};
