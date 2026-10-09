# basis — notas del proyecto

## El nombre

El agente se llama **basis**. Siempre `basis`, nunca «Basi» ni ninguna otra
forma abreviada. Y en minúscula, también al principio de frase: es como se
escribe la marca.

## Identidad

Verde esmeralda `#3DBE74` sobre fondo oscuro, y solo Inter. La tipografía se
sirve desde `presentacion/assets/fonts/`, no desde Google Fonts: en una sala
sin internet la presentación no debe cambiar de letra a mitad de reunión.

## Cifras

Nunca inventar precios, cifras de clientes ni testimonios. Los planes son
Solo 49 € · Estudio 129 € · Constructora 249 € · Enterprise a medida, al mes y
con IVA aparte; el pago anual los deja en 40 · 106 · 204, un 18 % menos. Los
módulos en producción, 29 de 70. Si hace falta un dato que no está, se
pregunta: tampoco se deduce. El total anual, por ejemplo, no es el mensual por
doce, y ponerlo calculado sería inventarlo.

## La presentación

`presentacion/` es el deck de 19 slides. Al tocarlo hay que comprobar siempre
las tres superficies, porque se comportan distinto: escritorio (con ratón),
móvil (táctil, con `mobile-lite.js` recortando lo que cuesta memoria de GPU) y
la impresión a PDF, que debe seguir saliendo en 19 páginas.

Al proyectar manda el escritorio: nada de lo que se añada para el móvil puede
cambiar cómo se ve en una pantalla grande.
