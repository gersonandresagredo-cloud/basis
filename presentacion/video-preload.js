/* BASIS · Carga de los vídeos bajo demanda
 *
 * Las slides 8 y 17 llevan un vídeo 1080p de unos 17 MB cada una. Con
 * preload="auto" el navegador se traía los dos nada más abrir la
 * presentación: 35 MB antes de ver la primera slide. Con datos móviles eso
 * tumbaba la pestaña en el iPhone ("ha generado problemas repetidamente").
 *
 * Ahora los <video> salen con preload="none" y este script los va preparando
 * sobre la marcha: al entrar en una slide deja lista la siguiente, y suelta
 * el vídeo que ya queda lejos para no acumular los dos en memoria. Al
 * proyectar no se nota, porque el vídeo se prepara mientras se habla de la
 * slide anterior.
 */
(() => {
  const stage = document.querySelector('deck-stage');
  if (!stage) return;
  const slides = [...stage.children];
  // La URL se guarda de entrada: soltar un vídeo le borra el src del elemento,
  // y sin haberla apuntado antes no habría forma de volver a cargarlo.
  slides.forEach(s => {
    const v = s.querySelector('video');
    if (v) v.dataset.src = v.getAttribute('src') || '';
  });

  const prime = v => {
    if (!v || v.getAttribute('src')) return;    // ya está cargado o cargando
    v.preload = 'auto';
    v.setAttribute('src', v.dataset.src);
    v.load();
  };

  const release = v => {
    if (!v || !v.getAttribute('src')) return;
    v.pause();
    v.removeAttribute('src');
    v.load();                                   // esto es lo que libera el búfer
  };

  const sync = i => {
    slides.forEach((s, n) => {
      const v = s.querySelector('video');
      if (!v) return;
      // La slide actual y sus vecinas se quedan listas; el resto se sueltan.
      if (Math.abs(n - i) <= 1) prime(v); else release(v);
    });
  };

  stage.addEventListener('slidechange', e => sync(e.detail.index));
  sync(stage.index || 0);
})();
