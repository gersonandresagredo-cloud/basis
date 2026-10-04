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

La presentación es 1920×1080 y se escala sola a la pantalla que tenga la sala,
con letterbox y sin recortes.

## En el móvil

El visor detecta la pantalla táctil y cambia tres cosas: gira la presentación
90° cuando el teléfono está en vertical, para que la slide llene la pantalla
en lugar de quedarse en una franja; deja la barra de control siempre a la
vista, porque sin ratón no hay forma de hacer volver una barra escondida; y
añade dos franjas de paso en los laterales.

Esas franjas no son un adorno: la slide 12 lleva tarjetas clicables que se
quedan con el toque antes de que la presentación lo reciba, así que tocando
el centro no se pasaba de página. Por los lados se pasa siempre, en cualquier
slide. Al poner el teléfono en horizontal, la rotación se quita sola.

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
