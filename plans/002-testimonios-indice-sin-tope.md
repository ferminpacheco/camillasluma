# 002 — Acotar el índice del carrusel de testimonios

- **Status**: DONE (aplicado sobre 2424b60)
- **Commit**: 2424b60
- **Severity**: HIGH
- **Category**: Interrumpibilidad
- **Estimated scope**: 1 archivo, ~8 líneas

## Problem

Clickear rápido la flecha "siguiente" del carrusel de testimonios lo deja
**mostrando espacio en blanco**, y el reset posterior **teleporta a la slide
equivocada**. Ambos estados se alcanzan con un spam de botón normal.

Contexto del componente (verificado en el código):

- `total` = 5 slides originales por página (confirmado en
  `camillas-electricas/premium/index.njk` y `carritos-auxiliares/luma-cart/index.njk`).
- El set se clona entero, así que el track tiene **10 hijos** (índices 0-9).
- `visible` = 3 en desktop, 2 entre 769-900px, 1 en mobile.
- `update()` traslada el track `current * (100 / visible)` %, o sea un ancho
  de slide por unidad de `current`.
- Para que las 3 columnas visibles tengan contenido hace falta que exista el
  índice `current + 2`. Con 10 hijos, **el máximo válido de `current` es 7**.

```js
// assets/js/main.js:448-459 — actual
  function next() {
    clearTimeout(resetTimer);
    current++;
    update(true);
    if (current >= total) {
      resetTimer = setTimeout(() => {
        current = 0;
        update(false);
      }, TRANSITION_MS + 50);
    }
  }
```

Dos defectos distintos en ese bloque:

**a) `current` no tiene tope.** Cada click hace `clearTimeout(resetTimer)` y
reprograma el reset a +650 ms. Clickear más rápido que eso incrementa `current`
indefinidamente: 5 → 6 → 7 → **8**, y en 8 el track pide los índices 8, 9 y 10.
El 10 no existe → tercera columna vacía.

**b) El reset salta a `0` en vez de normalizar.** Estando en `current = 6` la
vista muestra los clones 6, 7, 8 — que son visualmente las slides 1, 2, 3.
Resetear a `0` muestra 0, 1, 2. El carrusel **retrocede una slide de golpe**
en lugar de continuar. Solo es correcto cuando `current` es exactamente `total`.

## Target

Normalizar el índice **antes** de avanzar, y que el reset reste `total` en vez
de ir a cero. Con esto `current` queda acotado al rango `[0, total]` siempre,
y el índice máximo usado pasa a ser `total` (5), que con 10 hijos es seguro
para los tres valores de `visible`.

```js
// target — assets/js/main.js, reemplaza next() completo
  function next() {
    clearTimeout(resetTimer);

    // Si venimos de un ciclo ya completado, normalizamos sin animar ANTES de
    // avanzar. Sin esto `current` crece sin tope cuando los clicks llegan más
    // rápido que el reset, y termina pidiendo índices que no existen en el
    // track clonado: la última columna queda vacía.
    if (current >= total) {
      current -= total;
      update(false);
      track.offsetHeight; // reflow para que el salto no se anime
    }

    current++;
    update(true);

    if (current >= total) {
      resetTimer = setTimeout(() => {
        // Restar `total` y no ir a 0: en el set clonado la posición `current`
        // es visualmente idéntica a `current - total`, así que el salto es
        // invisible. Ir a 0 haría retroceder el carrusel.
        current -= total;
        update(false);
      }, TRANSITION_MS + 50);
    }
  }
```

Verificación aritmética del tope, para los tres breakpoints:

| `visible` | Índices que hay que renderizar | Máximo `current` seguro | Máximo con este fix |
| --- | --- | --- | --- |
| 3 (desktop) | `current` … `current + 2` | 7 | 5 ✅ |
| 2 (769-900px) | `current` … `current + 1` | 8 | 5 ✅ |
| 1 (mobile) | `current` | 9 | 5 ✅ |

## Repo conventions to follow

- JS vanilla sin build. Nombres de variables y comentarios **en español**.
- El patrón "saltar sin animar y forzar reflow" ya existe en este mismo
  archivo y hay que imitarlo tal cual. Exemplar — `assets/js/main.js:461-469`
  (la función `prev()`), que hace exactamente esta maniobra:
  ```js
    if (current === 0) {
      current = total;
      update(false);
      track.offsetHeight; // forzar reflow antes de animar
      current = total - 1;
      update(true);
    }
  ```
- El comentario existente en `assets/js/main.js:443-446` ya documenta por qué
  el reset va por timer y no por `transitionend`. **Conservarlo intacto**, está
  justo arriba de `next()`.

## Steps

1. Abrir `assets/js/main.js`.
2. Localizar la función `next()` en las líneas 448-459 (empieza en
   `function next() {` y termina en el `}` que cierra la función, justo antes
   de la línea en blanco que precede a `function prev()`).
3. Reemplazar la función completa por el bloque de la sección **Target**.
4. **No** tocar el comentario de las líneas 443-446 que está encima.
5. No tocar `prev()`, `update()`, `restartAutoplay()` ni el handler de `resize`.

## Boundaries

- NO tocar `assets/css/main.css`.
- NO tocar el carrusel de producto (`assets/js/main.js:340-410`) — es otro
  componente con otros defectos, que son hallazgos separados.
- NO cambiar `TRANSITION_MS`, `AUTOPLAY_MS` ni la curva de la transición.
  Que `TRANSITION_MS` valga 600 y use la curva equivocada son hallazgos
  distintos, **fuera del alcance de este plan**.
- NO agregar `focusin`/`focusout` ni un control de pausa al autoplay: también
  es un hallazgo separado.
- NO cambiar la cantidad de slides ni el markup en los `.njk`.
- NO agregar dependencias.
- Si `next()` no coincide con lo transcripto arriba (drift desde 2424b60),
  PARAR y reportar.

## Verification

- **Mecánica**:
  - `node --check assets/js/main.js` → sin output, exit 0.
  - `npx @11ty/eleventy` → `Wrote 18 files`.
- **Feel check** — servir con `npx @11ty/eleventy --serve --port=8081`
  (**no usar el 8080**, está reservado) y abrir
  `http://localhost:8081/camillas-electricas/premium/`, sección de testimonios:
  - Clickear la flecha derecha **10 veces lo más rápido posible**. En ningún
    momento debe aparecer una columna vacía a la derecha. Hoy aparece.
  - Después del spam, esperar 1 segundo y seguir clickeando de a uno: la
    secuencia de testimonios debe continuar en orden, sin retroceder de golpe.
  - Dejar el autoplay correr solo (4,5 s por paso) durante ~40 segundos, o sea
    más de una vuelta completa: el loop debe verse continuo, sin ningún salto
    perceptible al cruzar el punto de reset.
  - Verificar en consola que `current` queda acotado. Pegar en DevTools mientras
    se spammea: no hace falta instrumentar nada, alcanza con confirmar que el
    `translateX` del track nunca supera `-166.66%` en desktop
    (= `total * (100/3)` = 5 × 33,33%). Inspeccionar
    `.testimonio-carousel-track` y mirar su `style.transform`.
  - Probar en los tres breakpoints (ancho > 900px, 800px, 500px): en los tres,
    ninguna columna debe quedar vacía tras el spam.
  - Activar `prefers-reduced-motion: reduce` (DevTools → Rendering): el autoplay
    no debe arrancar, y las flechas deben seguir funcionando sin dejar huecos.
- **Done when**: 10 clicks rápidos seguidos no producen ninguna columna vacía
  en ninguno de los tres breakpoints, y el carrusel nunca retrocede una slide
  sola después de completar un ciclo.
