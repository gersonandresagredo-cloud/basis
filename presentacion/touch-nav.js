/* BASIS · Controles para pantalla táctil
 *
 * En el móvil la presentación se abre directamente, sin la landing de por
 * medio, así que los controles tienen que vivir aquí. Solo se activan cuando
 * no hay ratón: en sala y en escritorio no cambia nada.
 *
 * Las franjas laterales no son un adorno. La slide 12 lleva tarjetas
 * clicables cuyo handler llama a stopPropagation, así que el toque muere ahí
 * y nunca llega al componente, que es quien pasa de slide al tocar: con el
 * dedo la presentación se quedaba encallada. Por los lados se pasa siempre.
 */
(() => {
  if (!matchMedia('(hover:none)').matches) return;
  const stage = document.querySelector('deck-stage');
  if (!stage) return;

  // Fuera el rail de miniaturas y el contador de autor: esto es presentar,
  // no editar. El rail solo se esconde solo por debajo de 640 px, y un móvil
  // en horizontal pasa de ahí.
  stage.setAttribute('no-rail', '');
  try { window.postMessage({ __omelette_presenting: true }, '*'); } catch (e) {}

  const total = stage.children.length;
  const css = `
    .tn{position:fixed;z-index:2147483000;font-family:'Inter',system-ui,sans-serif;-webkit-tap-highlight-color:transparent}
    /* La banda de arriba se deja libre: ahí viven los controles de la slide
       (el selector mensual/anual de la 13), y una franja de paso por encima
       se quedaría con el toque. Las tarjetas clicables de la 12 están a
       media altura, así que siguen cubiertas. */
    .tn-z{top:19%;bottom:0;width:16%;background:none;border:0;padding:0}
    .tn-z.l{left:0}.tn-z.r{right:0}
    .tn-bar{left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);
      display:flex;align-items:center;gap:4px;padding:6px;border-radius:15px;
      border:1px solid rgba(255,255,255,.14);background:rgba(14,16,15,.85);
      -webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);
      box-shadow:0 20px 50px -22px rgba(0,0,0,.95)}
    .tn-bar button{display:flex;align-items:center;justify-content:center;min-width:42px;height:40px;
      padding:0 11px;border:0;border-radius:11px;background:none;color:#D9DEDB;font:inherit;font-size:14px;font-weight:600}
    .tn-bar button:active{background:rgba(61,190,116,.2);color:#fff}
    .tn-bar svg{width:17px;height:17px;stroke:currentColor;stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round}
    .tn-pos{padding:0 10px;font-size:13px;font-weight:600;color:#A8A8A8;font-variant-numeric:tabular-nums;white-space:nowrap}
    .tn-sep{width:1px;height:20px;background:rgba(255,255,255,.14);margin:0 2px}
    .tn-turn{left:50%;top:calc(14px + env(safe-area-inset-top));transform:translateX(-50%);
      display:none;align-items:center;gap:9px;padding:9px 15px;border-radius:12px;
      border:1px solid rgba(61,190,116,.4);background:rgba(14,16,15,.88);
      -webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);
      color:#D9DEDB;font-size:13px;font-weight:500;white-space:nowrap}
    .tn-turn svg{width:16px;height:16px;stroke:#3DBE74;stroke-width:1.9;fill:none;stroke-linecap:round;stroke-linejoin:round}
    @media (orientation:portrait){.tn-turn{display:flex}}
    @media print{.tn{display:none!important}}`;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

  const go = d => { try { stage.goTo(stage.index + d); } catch (e) {} };
  const zone = (side, d) => {
    const el = document.createElement('button');
    el.className = `tn tn-z ${side}`;
    el.setAttribute('aria-label', d > 0 ? 'Siguiente slide' : 'Slide anterior');
    el.addEventListener('click', e => { e.preventDefault(); go(d); });
    document.body.appendChild(el);
  };
  zone('l', -1); zone('r', 1);

  // Volver solo si se llegó desde otra página nuestra: abierta en directo no
  // hay sitio al que volver y el botón sobraría.
  const cameFromSite = (() => {
    try { return !!document.referrer && new URL(document.referrer).origin === location.origin
      && !/\/presentacion\//.test(new URL(document.referrer).pathname); } catch (e) { return false; }
  })();

  const bar = document.createElement('div');
  bar.className = 'tn tn-bar';
  bar.innerHTML =
    `<button data-go="-1" aria-label="Slide anterior"><svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></button>` +
    `<span class="tn-pos">1 / ${total}</span>` +
    `<button data-go="1" aria-label="Siguiente slide"><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>` +
    (cameFromSite
      ? `<span class="tn-sep"></span><button data-back aria-label="Salir"><svg viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>`
      : '');
  document.body.appendChild(bar);

  const pos = bar.querySelector('.tn-pos');
  bar.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-back')) history.back(); else go(+b.dataset.go);
  });

  const turn = document.createElement('div');
  turn.className = 'tn tn-turn';
  turn.innerHTML = `<svg viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="3"/><path d="M10 18h4"/></svg>Gira el móvil para verla a pantalla completa`;
  document.body.appendChild(turn);

  // El componente ya ha aplicado el #N de la URL antes de que corra esto, así
  // que su evento de arranque no llega: el contador se pone a mano.
  const setPos = () => { pos.textContent = ((stage.index || 0) + 1) + ' / ' + total; };
  stage.addEventListener('slidechange', e => { pos.textContent = (e.detail.index + 1) + ' / ' + total; });
  setPos();
  requestAnimationFrame(setPos);
})();
