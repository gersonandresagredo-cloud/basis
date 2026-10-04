/* BASIS · Los vídeos se traen cuando toca, no al abrir
 *
 * Las slides 8 y 17 llevan un vídeo 1080p de unos 17 MB. Con preload="auto"
 * el navegador se traía los dos nada más abrir la presentación: 35 MB antes
 * de ver la primera slide, que con datos móviles tumbaba la pestaña en el
 * iPhone ("ha generado problemas repetidamente").
 *
 * Los <video> salen ahora con preload="metadata" —unos kilobytes de cabecera—
 * y este script sube a "auto" el de la slide siguiente, para que se vaya
 * trayendo mientras se habla de la anterior.
 *
 * Aquí solo se toca el atributo preload. Quitar y reponer el src parece el
 * modo evidente de liberar memoria, pero deja al <video> como recién creado:
 * Safari le retira el permiso de reproducir que traía del primer toque y el
 * vídeo se queda en negro. No merece la pena.
 */
(() => {
  const stage = document.querySelector('deck-stage');
  if (!stage) return;
  const slides = [...stage.children];

  const sync = i => {
    slides.forEach((s, n) => {
      const v = s.querySelector('video');
      if (v) v.preload = Math.abs(n - i) <= 1 ? 'auto' : 'metadata';
    });
  };

  stage.addEventListener('slidechange', e => sync(e.detail.index));
  sync(stage.index || 0);
})();
