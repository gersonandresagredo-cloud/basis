/* BASIS · Versión ligera para pantallas táctiles
 *
 * La presentación está hecha para un proyector: 47 animaciones en bucle, un
 * campo de partículas a pantalla completa, degradados de 900 px, sombras
 * difuminadas y máscaras. En un monitor eso no se nota. En un iPhone, cada
 * uno de esos efectos obliga a Safari a reservar una capa de composición en
 * memoria de GPU, y el presupuesto de una pestaña es pequeño: medido con las
 * 19 slides en el árbol de render salían hasta 81 capas, 42 MB de superficie
 * y 80 animaciones corriendo a la vez, de las cuales 85 pertenecían a slides
 * que ni se veían. Por eso Safari mataba la pestaña ("ha generado problemas
 * repetidamente") y volvía a cargar en la slide 1.
 *
 * Aquí se apaga el movimiento decorativo cuando no hay ratón: 55 capas,
 * 26 MB y ninguna animación en bucle. El contenido —textos, colores,
 * imágenes, vídeos y la estructura de cada slide— no cambia; lo que se va es
 * lo que se mueve de fondo. Con ratón, es decir al proyectar y en escritorio,
 * no se toca absolutamente nada.
 */
(() => {
  if (!matchMedia('(hover:none)').matches) return;
  const stage = document.querySelector('deck-stage');
  if (!stage) return;

  document.head.insertAdjacentHTML('beforeend', `<style>@media screen{
    /* Las 19 slides viven a la vez en el documento, ocultas solo con opacity
       y visibility: siguen costando capas y animaciones. Fuera del render. */
    deck-stage>section:not([data-deck-active]){display:none!important}
    /* El foco verde que persigue al ratón: sin ratón no se mueve de sitio y
       se lleva una capa de 800x800 con will-change. Fuera.
       El campo de partículas y los degradados del fondo se quedan: son la
       cara de la presentación. El campo se aligera en prestamistas-fx2.js y
       los orbes son un radial-gradient estático, sin animación ni capa. */
    .spot{display:none!important}
    /* drop-shadow y máscaras obligan a renderizar en un búfer aparte. */
    .aiav,.basi-av,.agent{filter:none!important}
    .mq,.ph3g{-webkit-mask-image:none!important;mask-image:none!important}
    *{will-change:auto!important}
    /* El blur de fondo de la barra se recompone en cada frame. */
    .tn-bar,.tn-turn{-webkit-backdrop-filter:none!important;backdrop-filter:none!important;background:#121413!important}
  }</style>`);

  // Las animaciones de entrada son finitas y se dejan: son las que hacen
  // aparecer el contenido. Las de bucle se congelan a mitad de ciclo en vez
  // de cancelarse: cancelar devuelve el elemento a su estado de partida y
  // varias arrancan desde apagado (los checks de las tarjetas se quedarían
  // vacíos). Pausadas a mitad se ven encendidas y no cuestan ni un frame.
  const stop = () => {
    for (const a of document.getAnimations()) {
      const t = a.effect && a.effect.getTiming && a.effect.getTiming();
      if (!t || t.iterations !== Infinity || a.playState === 'paused') continue;
      try {
        const d = t.duration;
        if (typeof d === 'number' && d > 0) a.currentTime = (t.delay || 0) + d * 0.5;
        a.pause();
      } catch (e) {}
    }
  };
  // Tres pasadas: al entrar en la slide, al primer frame y una tardía, porque
  // algunas animaciones nacen con retardo.
  const kick = () => { stop(); requestAnimationFrame(stop); setTimeout(stop, 500); };
  stage.addEventListener('slidechange', kick);
  kick();
})();
