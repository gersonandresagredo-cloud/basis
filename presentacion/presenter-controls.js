/* BASIS · Mando de presentador: vídeo y tiempo
 *
 * Los vídeos de las slides 8 y 17 arrancaban solos y no había forma de
 * pararlos, de volver atrás ni de saber cuánto quedaba. Presentando, eso te
 * deja esperando a que acabe. Aquí van los controles.
 *
 * - Barra de vídeo: aparece sola en las slides que llevan vídeo. Play/pausa,
 *   barra de tiempo para saltar, -10/+10 s y silencio. Con ratón se esconde a
 *   los pocos segundos de quietud; con el dedo se queda fija. Pulsar sobre el
 *   vídeo también pausa y reanuda.
 * - Cronómetro: cuenta lo que llevas de presentación y lo que llevas en la
 *   slide. Empieza oculto porque el público ve la misma pantalla; se saca con
 *   la tecla T. Sobrevive a una recarga, que para eso guarda la hora de
 *   arranque.
 *
 * Teclas: P o K pausa el vídeo · J y L saltan 10 s · M silencia · T el
 * cronómetro. El espacio y las flechas siguen siendo de la presentación.
 */
(() => {
  const stage = document.querySelector('deck-stage');
  if (!stage) return;
  const TOUCH = matchMedia('(hover:none)').matches;

  const css = `
  /* Por encima de las franjas de paso de touch-nav: es un control que se
     pulsa a propósito, no debe quedar debajo de una zona de navegación. */
  .pc{position:fixed;z-index:2147483100;font-family:'Inter',system-ui,sans-serif;
      -webkit-tap-highlight-color:transparent;color:#D9DEDB}
  .pc button{border:0;background:none;color:inherit;font:inherit;cursor:pointer;
      display:flex;align-items:center;justify-content:center}
  .pc svg{stroke:currentColor;stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round}

  /* ── barra de vídeo ── */
  .pc-v{left:50%;transform:translateX(-50%);bottom:calc(${TOUCH ? '78px + env(safe-area-inset-bottom)' : '74px'});
      display:none;align-items:center;gap:10px;padding:9px 14px;
      width:min(620px,calc(100vw - ${TOUCH ? '34vw - 24px' : '32px'}));
      border-radius:16px;border:1px solid rgba(255,255,255,.14);background:rgba(14,16,15,.9);
      box-shadow:0 22px 56px -24px rgba(0,0,0,.95);
      opacity:0;pointer-events:none;transition:opacity .25s}
  .pc-v[data-on]{display:flex}
  .pc-v[data-show]{opacity:1;pointer-events:auto}
  .pc-v button{min-width:36px;height:36px;border-radius:10px}
  .pc-v button:hover{background:rgba(61,190,116,.18);color:#fff}
  .pc-v button svg{width:17px;height:17px}
  .pc-v .pc-play svg{width:20px;height:20px}
  .pc-t{font-size:12.5px;font-weight:600;font-variant-numeric:tabular-nums;color:#A8A8A8;white-space:nowrap}
  .pc-s{flex:1;min-width:60px;height:22px;margin:0;background:none;-webkit-appearance:none;appearance:none;cursor:pointer}
  .pc-s::-webkit-slider-runnable-track{height:4px;border-radius:4px;
      background:linear-gradient(90deg,#3DBE74 var(--p,0%),rgba(255,255,255,.18) var(--p,0%))}
  .pc-s::-moz-range-track{height:4px;border-radius:4px;background:rgba(255,255,255,.18)}
  .pc-s::-moz-range-progress{height:4px;border-radius:4px;background:#3DBE74}
  .pc-s::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;
      background:#fff;margin-top:-4.5px;box-shadow:0 2px 8px rgba(0,0,0,.6)}
  .pc-s::-moz-range-thumb{width:13px;height:13px;border:0;border-radius:50%;background:#fff}

  /* ── cronómetro ── */
  .pc-c{top:calc(14px + env(safe-area-inset-top));right:14px;display:none;align-items:center;gap:12px;
      padding:9px 13px;border-radius:13px;border:1px solid rgba(255,255,255,.13);
      background:rgba(14,16,15,.88);box-shadow:0 18px 44px -22px rgba(0,0,0,.9);cursor:pointer;
      font-variant-numeric:tabular-nums;user-select:none}
  .pc-c[data-on]{display:flex}
  .pc-c b{font-size:19px;font-weight:600;letter-spacing:-.02em;color:#fff}
  .pc-c span{font-size:11px;font-weight:500;color:#6E7571;letter-spacing:.04em;text-transform:uppercase}
  .pc-c i{font-style:normal;font-size:13px;font-weight:600;color:#3DBE74}
  .pc-c[data-paused] b{color:#A8A8A8}
  .pc-c[data-paused]::after{content:"II";font-size:10px;font-weight:700;color:#3DBE74;letter-spacing:1px}

  @media print{.pc{display:none!important}}`;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

  const mmss = s => {
    s = Math.max(0, Math.floor(s || 0));
    const m = Math.floor(s / 60);
    return (m >= 60 ? Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0') : m) + ':' + String(s % 60).padStart(2, '0');
  };
  const ico = d => `<svg viewBox="0 0 24 24">${d}</svg>`;
  const PLAY = ico('<path d="M7 4l13 8-13 8V4z" fill="currentColor" stroke="none"/>');
  const PAUSE = ico('<rect x="7" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/>');

  // ───────────────────────── barra de vídeo
  const bar = document.createElement('div');
  bar.className = 'pc pc-v';
  bar.innerHTML =
    `<button class="pc-play" aria-label="Pausar o reanudar">${PAUSE}</button>` +
    `<button class="pc-back" aria-label="Atrás 10 segundos">${ico('<path d="M11 7v10M7 12l4-5v10l-4-5z" fill="currentColor" stroke="none"/><path d="M17 7v10"/>')}</button>` +
    `<button class="pc-fwd" aria-label="Adelante 10 segundos">${ico('<path d="M13 7v10M17 12l-4-5v10l4-5z" fill="currentColor" stroke="none"/><path d="M7 7v10"/>')}</button>` +
    `<span class="pc-t pc-now">0:00</span>` +
    `<input class="pc-s" type="range" min="0" max="1000" value="0" step="1" aria-label="Posición del vídeo">` +
    `<span class="pc-t pc-dur">0:00</span>` +
    `<button class="pc-mute" aria-label="Silenciar">${ico('<path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M19 6a8 8 0 0 1 0 12"/>')}</button>`;
  document.body.appendChild(bar);

  const el = s => bar.querySelector(s);
  const btPlay = el('.pc-play'), slider = el('.pc-s'),
        now = el('.pc-now'), dur = el('.pc-dur'), btMute = el('.pc-mute');
  let vid = null, hideT = 0, dragging = false;

  const show = () => {
    if (!vid) return;
    bar.setAttribute('data-show', '');
    clearTimeout(hideT);
    if (TOUCH) return;                     // sin ratón no hay forma de hacerla volver
    hideT = setTimeout(() => { if (!dragging) bar.removeAttribute("data-show"); }, 4500);
  };

  const paint = () => {
    if (!vid) return;
    const d = isFinite(vid.duration) ? vid.duration : 0;
    btPlay.innerHTML = vid.paused ? PLAY : PAUSE;
    now.textContent = mmss(vid.currentTime);
    dur.textContent = mmss(d);
    if (!dragging) {
      const p = d ? (vid.currentTime / d) * 1000 : 0;
      slider.value = p;
      slider.style.setProperty('--p', (p / 10) + '%');
    }
    btMute.style.opacity = vid.muted ? '.45' : '1';
  };

  const attach = v => {
    if (vid === v) return;
    if (vid) ['play','pause','timeupdate','loadedmetadata','ended','volumechange']
      .forEach(e => vid.removeEventListener(e, paint));
    vid = v;
    bar.toggleAttribute('data-on', !!v);
    if (!v) { bar.removeAttribute('data-show'); return; }
    ['play','pause','timeupdate','loadedmetadata','ended','volumechange']
      .forEach(e => v.addEventListener(e, paint));
    // Pulsar el propio vídeo pausa y reanuda. Hay que cortar el evento o la
    // presentación lo toma por un toque para pasar de slide.
    if (!v.dataset.pcTap) {
      v.dataset.pcTap = '1';
      v.addEventListener('click', e => { e.stopPropagation(); toggle(); show(); });
    }
    paint(); show();
  };

  const toggle = () => { if (!vid) return; vid.paused ? vid.play().catch(() => {}) : vid.pause(); };
  const seek = d => { if (vid) vid.currentTime = Math.max(0, Math.min(vid.duration || 0, vid.currentTime + d)); };

  btPlay.addEventListener('click', () => { toggle(); show(); });
  el('.pc-back').addEventListener('click', () => { seek(-10); show(); });
  el('.pc-fwd').addEventListener('click', () => { seek(10); show(); });
  btMute.addEventListener('click', () => { if (vid) vid.muted = !vid.muted; show(); });
  slider.addEventListener('pointerdown', () => { dragging = true; });
  slider.addEventListener('input', () => {
    slider.style.setProperty('--p', (slider.value / 10) + '%');
    if (vid && isFinite(vid.duration)) now.textContent = mmss(vid.duration * slider.value / 1000);
  });
  const drop = () => {
    // Sin exigir que se venga de un arrastre: con la barra enfocada, las
    // flechas mueven el valor y disparan change sin ningún pointerdown.
    if (vid && isFinite(vid.duration)) vid.currentTime = vid.duration * slider.value / 1000;
    dragging = false; show();
  };
  slider.addEventListener('pointerup', drop);
  slider.addEventListener('change', drop);
  bar.addEventListener('pointermove', show);

  // ───────────────────────── cronómetro
  const cron = document.createElement('div');
  cron.className = 'pc pc-c';
  cron.innerHTML = `<div><b>0:00</b><br><span>total</span></div><i>0:00</i>`;
  cron.title = 'Clic para pausar · doble clic para poner a cero';
  document.body.appendChild(cron);
  const cTot = cron.querySelector('b'), cSlide = cron.querySelector('i');

  const KEY = 'basis-cron';
  let t0 = +sessionStorage.getItem(KEY) || 0;   // ms de inicio; 0 = sin arrancar
  let acc = +sessionStorage.getItem(KEY + '-acc') || 0;
  let slideT0 = performance.now();

  const save = () => {
    try { sessionStorage.setItem(KEY, String(t0)); sessionStorage.setItem(KEY + '-acc', String(acc)); } catch (e) {}
  };
  const elapsed = () => acc + (t0 ? (Date.now() - t0) / 1000 : 0);
  const tick = () => {
    cTot.textContent = mmss(elapsed());
    cSlide.textContent = mmss((performance.now() - slideT0) / 1000);
    cron.toggleAttribute('data-paused', !t0);
  };
  setInterval(tick, 500);

  cron.addEventListener('click', () => {
    if (t0) { acc = elapsed(); t0 = 0; } else { t0 = Date.now(); }
    save(); tick();
  });
  cron.addEventListener('dblclick', () => { acc = 0; t0 = Date.now(); save(); tick(); });

  // ───────────────────────── enganche con la presentación
  // Arranca al primer paso de slide, no al abrir: entre que se abre la
  // presentación y se empieza a hablar puede pasar un rato.
  const start = () => { if (!t0 && !acc) { t0 = Date.now(); save(); tick(); } };
  const onSlide = () => {
    slideT0 = performance.now();
    const s = stage.children[stage.index];
    attach(s ? s.querySelector('video') : null);
    start();
  };
  stage.addEventListener('slidechange', onSlide);
  attach((stage.children[stage.index] || {}).querySelector
    ? stage.children[stage.index].querySelector('video') : null);
  tick();

  addEventListener('mousemove', () => { if (vid) show(); }, { passive: true });

  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) return;
    const k = e.key.toLowerCase();
    if (k === 't') { e.preventDefault(); if (cron.toggleAttribute('data-on')) start(); tick(); return; }
    if (!vid) return;
    if (k === 'p' || k === 'k') { e.preventDefault(); toggle(); show(); }
    else if (k === 'j') { e.preventDefault(); seek(-10); show(); }
    else if (k === 'l') { e.preventDefault(); seek(10); show(); }
    else if (k === 'm') { e.preventDefault(); vid.muted = !vid.muted; show(); }
  });
})();
