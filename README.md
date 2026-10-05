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

`mobile-lite.js` apaga el movimiento decorativo. La presentación está hecha
para un proyector —47 animaciones en bucle, un campo de partículas a pantalla
completa, degradados de 900 px, sombras difuminadas y máscaras— y cada uno de
esos efectos le cuesta a Safari una capa de composición en memoria de GPU.
Medido con Chromium emulando un iPhone: 81 capas, 42 MB de superficie y 80
animaciones corriendo, de las cuales 85 pertenecían a slides que ni se veían,
porque las 19 están a la vez en el árbol de render (el componente las oculta
con opacity y visibility, no con display:none). Un iPhone no llega: mata la
pestaña y recarga.

Con el modo ligero quedan 26 MB y ninguna animación en marcha. Los textos,
los colores, las imágenes, los vídeos y la estructura de cada slide no
cambian; se va lo que se mueve de fondo. Las animaciones en bucle se congelan
a mitad de ciclo en vez de cancelarse, para que lo que ellas encienden —los
checks de las tarjetas, por ejemplo— se vea encendido.

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
