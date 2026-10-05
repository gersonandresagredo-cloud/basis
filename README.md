# basis — landing + presentación proyectable

Landing de **basis** con la presentación del 5 de octubre dentro, lista para
enchufar a un proyector.

```
index.html              Landing: portada, índice de las 19 slides y guía de sala
og.png                  Imagen de previsualización al compartir el enlace
presentacion/           La presentación, tal cual
  index.html            Las 19 slides
  deck-stage.js         Componente que escala, navega e imprime el deck
  image-slot.js
  present-keys.js       Tecla F para pantalla completa
  video-preload.js      Trae cada vídeo cuando se acerca su slide
  touch-nav.js          Controles de paso y salida en pantallas táctiles
  mobile-lite.js        Apaga el movimiento decorativo en táctil
  presenter-controls.js Mando del presentador: barra de vídeo y cronómetro
  prestamistas-fx2.js   Partículas, isotipo, contadores y vídeos
  assets/               Vídeos, imagen del agente y la tipografía Inter
```

## Proyectar

Desde la landing, el botón **Proyectar** abre la presentación a pantalla
completa, sin miniaturas ni barras: solo la slide. Cualquier tarjeta del
índice arranca directamente en esa slide.

| Tecla | Qué hace |
|---|---|
| `→` `Espacio` `AvPág` | Siguiente slide |
| `←` `RePág` | Slide anterior |
| `1`–`9` | Salto directo |
| `F` | Pantalla completa |
| `R` | Volver a la portada |
| `Esc` | Salir de la proyección |
| `P` o `K` | Pausar o reanudar el vídeo de la slide |
| `J` / `L` | Retroceder o adelantar 10 segundos |
| `M` | Silenciar el vídeo |
| `T` | Cronómetro de la presentación |

La presentación es 1920×1080 y se escala sola a la pantalla que tenga la sala,
con letterbox y sin recortes.

## En el móvil

La landing no mete la presentación en un iframe: la abre en su propia página.
`touch-nav.js` pone dentro lo que hace falta sin ratón: barra con anterior /
siguiente / salir, dos franjas de paso en los laterales y un aviso para girar
el teléfono. Las franjas no son un adorno: la slide 12 lleva tarjetas
clicables que se quedan con el toque antes de que la presentación lo reciba,
así que tocando el centro no se pasaba de página.

`mobile-lite.js` recorta lo que a Safari le cuesta memoria de GPU. La
presentación está hecha para un proyector —47 animaciones en bucle,
degradados de 900 px, sombras difuminadas y máscaras— y cada efecto le cuesta
una capa de composición. Medido con Chromium emulando un iPhone: 81 capas,
42 MB de superficie y 80 animaciones corriendo, de las cuales 85 pertenecían a
slides que ni se veían, porque las 19 están a la vez en el árbol de render (el
componente las oculta con opacity y visibility, no con display:none). Un
iPhone no llega: mata la pestaña y recarga.

El modo ligero deja fuera del render las slides que no se ven, congela a mitad
de ciclo las animaciones en bucle —congelar y no cancelar, para que lo que
ellas encienden siga encendido— y quita sombras, máscaras y el foco verde que
persigue al ratón, que sin ratón no se mueve de sitio y se lleva una capa de
800×800. Queda en 34 MB y ninguna animación en marcha.

El campo de partículas del fondo **se queda**: es la cara de la presentación.
Lo que se hace es aligerarlo en `prestamistas-fx2.js`, que une cada punto con
los demás y por tanto cuesta O(n²) por fotograma: en táctil baja de 46 puntos
a 32 (menos de la mitad de trabajo) y pinta uno de cada tres fotogramas en vez
de uno de cada dos. Los degradados del fondo también se quedan: son un
radial-gradient estático, sin animación ni capa propia. Tenerlos cuesta 8 MB
sobre los 26 que costaría la versión sin nada de fondo, y siguen muy por
debajo de los 42 que tumbaban el teléfono.

Nada de esto se activa con ratón: al proyectar y en escritorio la
presentación queda exactamente como estaba, partículas incluidas. El
`will-change` del lienzo también se condiciona a que haya ratón: obliga a
Safari a rasterizar a 1920×1080 antes de escalar, y en un móvil la slide se
muestra a unos 390 px, así que se pintaría 25 veces más superficie de la
necesaria a triple densidad.

## Mando del presentador

Las slides con vídeo sacan su propia barra: pausar, saltar 10 segundos atrás o
adelante, moverte por la grabación arrastrando y silenciar. Pulsar sobre el
vídeo también lo para y lo reanuda. Con ratón la barra se esconde sola a los
pocos segundos de quietud y vuelve al mover el ratón; con el dedo se queda
fija, porque sin ratón no hay forma de hacerla volver.

El cronómetro (tecla `T`) cuenta lo que llevas de presentación y lo que llevas
en la slide actual. Empieza escondido a propósito: el público ve la misma
pantalla. Arranca al pasar de la primera slide, se pausa con un clic, se pone a
cero con doble clic y sobrevive a una recarga de la página.

No confundir con el temporizador de 10 minutos de la slide 14, que es parte de
la presentación y cuenta hacia atrás para el turno de preguntas.

## La slide 11

El esquema de agentes: **basis** en el centro y sus cuatro agentes alrededor
—presupuestos, obras y clientes, comercial y costes— con sus módulos. Los
cuatro se encienden por turnos cada 2,3 segundos: se ilumina la tarjeta, sus
módulos se encienden en cascada, el cable se pone verde, un punto de datos lo
recorre hacia basis y basis suelta una onda. Pulsar un agente fija ese y para
la rotación, que al presentar interesa poder quedarse en uno.

Las tarjetas se anclan por su centro al eje del que sale cada cable, así que
da igual que unas tengan más módulos que otras: los cables siempre encajan.
El ciclo solo corre con la slide delante.

Esta slide es la única que `mobile-lite.js` deja animada en el móvil: aquí el
movimiento es el contenido, no el decorado, y son cinco animaciones en una
sola slide. Al imprimir, el cable activo se pinta entero —el trazo
discontinuo del pulso lo dejaría partido— y los puntos de datos no salen.

**Enlace directo a una slide:** `index.html#slide-13` abre la landing y entra
en la slide 13. La presentación suelta también acepta `presentacion/#13`.

**PDF:** abre `presentacion/` e imprime. Salen 19 páginas, una por slide.

## Publicar

Son archivos estáticos: vale cualquier hosting. En GitHub Pages, activar
Pages sobre esta rama y servir desde la raíz.

Para verlo en local hace falta un servidor que soporte peticiones `Range`,
o los dos vídeos no cargarán:

```sh
npx http-server -p 8080 -c-1      # sirve en http://localhost:8080
```

`python -m http.server` **no** sirve: no implementa `Range` y Chrome no
reproduce los mp4.

## Qué se cambió del bundle original

La presentación se conserva slide a slide, con sus animaciones y su
maquetación. Solo se tocaron dos dependencias externas, sin ningún efecto
visual:

- **Inter** se sirve desde `presentacion/assets/fonts/` en lugar de Google
  Fonts. Si la sala no tiene internet, la presentación ya no cambia de
  tipografía a mitad de reunión.
- Se quitó el `<script>` del CDN que generaba códigos QR: no hay ningún
  `data-qr` en el deck, así que no pintaba nada.

El resultado funciona entero sin conexión, vídeos incluidos.

## Nota sobre los vídeos

Pesan unos 17 MB cada uno y venían con `preload="auto"`, que le dice al
navegador que se los traiga enteros antes de hacer falta. Ahora salen con
`preload="metadata"` —unos kilobytes de cabecera— y `video-preload.js` sube a
`auto` el de la slide siguiente, para que se vaya trayendo mientras se habla
de la anterior. Abrir la presentación transfiere 1,8 MB.

El src de los `<video>` no se toca nunca. Quitarlo y reponerlo parece el modo
evidente de liberar memoria, pero deja al elemento como recién creado y
Safari le retira el permiso de reproducir que traía del primer toque: el
vídeo se queda en negro.

Las slides 8 y 17 arrancan solas con sonido al entrar. El
navegador exige una interacción previa para permitir audio automático: al
abrir desde el botón de la landing ya está dada. Si aun así entra silenciado,
un clic sobre el vídeo lo reactiva. Sube el volumen de la sala antes de
empezar.
