/* ==========================================================================
   Reserva simulada
   --------------------------------------------------------------------------
   No hay backend y no se envía nada: el envío intercambia la pantalla del
   formulario por la de confirmación, que dice explícitamente que es una demo.

   Enchufar algo real después es sustituir el cuerpo de `envia()` por la
   llamada correspondiente y dejar el intercambio de pantalla para cuando esa
   llamada resuelva. El destino por tienda ya sale de lib/reserves.ts.

   La validación es la del navegador. Sólo se marca el primer campo inválido
   para que el foco no salte al final del formulario.
   ========================================================================== */

function iniciar(): void {
  const arrel = document.querySelector<HTMLElement>('[data-reserva]');
  const formulari = document.querySelector<HTMLFormElement>('[data-formulari-reserva]');
  const pantallaForm = document.querySelector<HTMLElement>('[data-reserva-form]');
  const pantallaOk = document.querySelector<HTMLElement>('[data-reserva-ok]');
  if (!arrel || !formulari || !pantallaForm || !pantallaOk) return;

  const envia = (): void => {
    /* Aquí iría la llamada real. Hoy no hay ninguna: ni red, ni almacenamiento. */
    pantallaForm.hidden = true;
    pantallaOk.hidden = false;

    /* Que el lector de pantalla y el scroll vayan a la confirmación: si no, en
       un formulario largo el cambio pasa desapercibido. */
    pantallaOk.setAttribute('tabindex', '-1');
    pantallaOk.focus({ preventScroll: true });
    pantallaOk.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  formulari.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!formulari.checkValidity()) {
      const primerInvalid = formulari.querySelector<HTMLInputElement>(':invalid');
      primerInvalid?.focus();
      primerInvalid?.reportValidity();
      return;
    }

    envia();
  });
}

iniciar();

/* Sense cap import, TypeScript tractaria el fitxer com un script global i
   les seves declaracions xocarien amb les dels altres scripts. Això el fa
   mòdul i li dona àmbit propi. */
export {};
