# 003 — Recuperar la transición de los dots del carrusel

- **Status**: DONE (aplicado sobre 2424b60)
- **Commit**: 2424b60
- **Severity**: HIGH
- **Category**: Cohesión / regresión
- **Estimated scope**: 1 archivo, ~10 líneas

## Problem

El dot activo del carrusel de producto **cambia de forma de golpe**: pasa de
círculo de 8 px a píldora de 22 px sin ninguna transición. Es una regresión
introducida al agregar el press feedback global.

La regla original declara la transición:

```css
/* assets/css/main.css:1231-1240 — actual */
.carousel-dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: width 0.2s, border-radius 0.2s, background-color 0.2s;
}

.carousel-dot.is-active {
  width: 22px;
  border-radius: 4px;
  background: var(--color-blanco);
}
```

Pero más abajo, el bloque de press feedback vuelve a declarar `.carousel-dot`
con **la misma especificidad (0,1,0) y más tarde en la cascada**, y `transition`
es una shorthand: reemplaza la lista entera en vez de sumarse.

```css
/* assets/css/main.css:2681-2692 — actual (pisa a la de arriba) */
.carousel-arrow,
.carousel-dot,
.testimonio-carousel-nav,
.color-dot,
.menu-toggle,
.contact-form button,
.faq-item summary,
.pdf-descarga-link {
  transition:
    background-color var(--dur-fast) ease,
    color var(--dur-fast) ease,
    transform var(--dur-press) var(--ease-out);
}
```

Resultado: sobrevive `background-color`, se pierden `width` y `border-radius`.
El cambio de estado teleporta, en cada click y también cada 5 s por el autoplay.

## Target

Devolverle a `.carousel-dot` su transición completa, **declarándola después**
del bloque de press feedback para ganar la cascada, y tokenizando los valores.

```css
/* target — agregar en assets/css/main.css, inmediatamente después del bloque
   de press feedback que termina en la línea 2692 */

/* La shorthand `transition` del bloque de press feedback de arriba reemplaza
   la lista entera, no se suma: sin volver a declararla acá, el dot activo
   pasaba de circulo de 8px a pildora de 22px de golpe.
   `width` es una propiedad de layout y el playbook la desaconseja, pero acá
   se acepta a conciencia: es un elemento de 8px dentro de un overlay
   `position: absolute`, y la transicion corre una vez por cambio de slide.
   Es la misma excepcion acotada que ya se documenta para el logo del header
   y para la altura del acordeon. */
.carousel-dot {
  transition:
    width var(--dur-fast) var(--ease-out),
    border-radius var(--dur-fast) var(--ease-out),
    background-color var(--dur-fast) ease,
    transform var(--dur-press) var(--ease-out);
}
```

Valores exactos: `--dur-fast` = 180 ms, `--dur-press` = 160 ms,
`--ease-out` = `cubic-bezier(0.23, 1, 0.32, 1)`. Los tres ya existen en
`assets/css/tokens.css`. La duración original hardcodeada era `0.2s`; se
migra a `--dur-fast` (180 ms), que es el token de la escala más cercano.

### Alternativa evaluada y descartada — no implementarla

Se consideró hacerlo con `transform: scaleX()` sobre un dot de ancho fijo de
22 px, para no animar layout. Se descarta: escalar horizontalmente un
rectángulo redondeado de 8 px de alto deforma el `border-radius` y el estado
inactivo deja de leerse como círculo. **No improvisar esta variante.**

## Repo conventions to follow

- Los tokens de motion viven en `assets/css/tokens.css` (bloque `MOTION`,
  líneas 52-72). **No crear tokens nuevos**: usar `--dur-fast`, `--dur-press`
  y `--ease-out`, que ya existen.
- Las excepciones deliberadas a las reglas de performance se documentan con un
  comentario en español que explica el porqué y acota el alcance. Exemplar a
  imitar — `assets/css/main.css:2922-2926`:
  ```css
  /* El logo manda la altura del header. Se anima `max-width` y no `transform`
     porque scale() no achica el layout: con transform el header seguía
     reservando los 100px y no se recuperaba nada de alto. Es una sola
     transición puntual al cruzar el umbral, no una por frame de scroll. */
  ```
- Las secciones nuevas de CSS van al final de su bloque temático, no
  intercaladas en el CSS heredado de arriba.

## Steps

1. Abrir `assets/css/main.css`.
2. Localizar el final del bloque de press feedback: la regla que empieza en
   la línea 2681 con el selector múltiple `.carousel-arrow, .carousel-dot, …`
   y cierra con `}` en la línea 2692.
3. Insertar el bloque completo de la sección **Target** (comentario + regla)
   inmediatamente después de ese `}`, separado por una línea en blanco.
4. **No borrar ni modificar** la regla original de la línea 1239. Queda como
   está; la nueva la pisa por orden de cascada. (Su limpieza es parte de otro
   hallazgo sobre reglas muertas.)
5. **No modificar** el bloque de press feedback de las líneas 2681-2692.

## Boundaries

- NO tocar `assets/js/main.js`.
- NO tocar `.carousel-slide`, `.carousel-arrow` ni `.carousel-dots`.
- NO borrar las otras reglas muertas del archivo: es un hallazgo separado.
- NO cambiar los valores de `.carousel-dot.is-active` (línea 1242-1246):
  `width: 22px` y `border-radius: 4px` quedan igual. Este plan solo devuelve
  la transición, no rediseña el dot.
- NO agregar tokens nuevos a `tokens.css`.
- NO agregar dependencias.
- Si el bloque de las líneas 2681-2692 no coincide con lo transcripto arriba
  (drift desde 2424b60), PARAR y reportar.

## Verification

- **Mecánica**:
  - `npx @11ty/eleventy` → `Wrote 18 files`.
  - Contar llaves balanceadas:
    `python -c "import io;s=io.open('assets/css/main.css',encoding='utf-8').read();print(s.count('{')==s.count('}'))"`
    → debe imprimir `True`.
- **Feel check** — servir con `npx @11ty/eleventy --serve --port=8081`
  (**no usar el 8080**, está reservado) y abrir
  `http://localhost:8081/camillas-electricas/premium/`:
  - Clickear los dots del carrusel del hero. El dot activo debe **estirarse**
    de círculo a píldora, no saltar. El que se desactiva debe encogerse.
  - Confirmar en DevTools que la transición efectiva es la nueva: inspeccionar
    un `.carousel-dot` y verificar que `transition-property` computa
    `width, border-radius, background-color, transform` (cuatro, no tres).
  - En DevTools → Animations, bajar a 10% y confirmar que el ancho interpola
    de forma continua y que el `border-radius` acompaña, sin que el dot se vea
    como un rectángulo duro a mitad de camino.
  - Dejar correr el autoplay (5 s por paso) y confirmar que el dot acompaña
    cada cambio automático de slide.
  - Verificar que el press feedback **sigue funcionando**: mantener apretado
    un dot debe encogerlo (`transform`). Si se perdió, la nueva regla está
    mal armada.
  - Activar `prefers-reduced-motion: reduce` (DevTools → Rendering): el dot
    debe seguir cambiando de forma (es indicación de estado, no decoración)
    y el press feedback debe desaparecer, que es lo que ya hace el bloque de
    las líneas 2823-2839.
- **Done when**: el dot activo se estira en vez de teleportar, `transition-property`
  computa las cuatro propiedades, y el press feedback sigue intacto.
