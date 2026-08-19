# 001 — Permitir reabrir una FAQ mientras se está cerrando

- **Status**: DONE (aplicado sobre 2424b60)
- **Commit**: 2424b60
- **Severity**: HIGH
- **Category**: Interrumpibilidad
- **Estimated scope**: 1 archivo, ~4 líneas

## Problem

En el acordeón de FAQ, un click que llega mientras el panel se está cerrando
**repite el cierre en vez de revertirlo**. El click del usuario se traga.

La causa: `item.open` recién pasa a `false` dentro de `onfinish`, o sea al
terminar los 240 ms de la animación de cierre. Durante todo ese tiempo el
`<details>` sigue reportando `open === true`, así que el cálculo de intención
da el resultado opuesto al que el usuario pidió.

```js
// assets/js/main.js:292-293 — actual
    const abriendo = !item.open;
    if (abriendo) item.open = true;
```

```js
// assets/js/main.js:320-328 — actual (item.open se apaga recién acá)
    propia.onfinish = () => {
      // Si otro click ya arrancó otra animación, este finish es viejo.
      if (animacion !== propia) return;
      if (!abriendo) item.open = false;
      item.removeAttribute('data-closing');
      panel.style.overflow = '';
      animacion = null;
      propia.cancel(); // libera el fill una vez aplicado el estado real
    };
```

Secuencia que falla, reproducible a mano:

1. Click en un `<summary>` abierto → arranca el cierre, se setea `data-closing`.
2. Segundo click antes de los 240 ms → `item.open` todavía es `true`, así que
   `abriendo = !true = false`.
3. Se vuelve a animar el cierre desde la altura actual. El panel se cierra
   igual y el usuario ve que su click no hizo nada.

El código ya tiene la señal que necesita: el atributo `data-closing` que se
setea en la línea 307. Simplemente no se consulta.

## Target

Consultar `data-closing` para determinar la intención. Si el panel está en
pleno cierre, cualquier click significa **reabrir**.

```js
// target — assets/js/main.js, reemplaza las líneas 292-293
    // `item.open` sigue en true durante todo el cierre (se apaga recién en
    // onfinish), así que sin consultar data-closing un click a mitad del
    // cierre repetiría el cierre en vez de revertirlo.
    const cerrandose = item.hasAttribute('data-closing');
    const abriendo = cerrandose ? true : !item.open;
    if (abriendo) item.open = true;
```

No hace falta nada más: el resto del handler ya funciona para este caso.

- `item.open = true` es un no-op cuando ya estaba en `true` (el caso de reapertura).
- `alturaActual` ya no es `null` (hay una animación en curso), así que `desde`
  toma la altura real del panel a mitad de camino y la animación arranca desde ahí.
- `item.toggleAttribute('data-closing', !abriendo)` en la línea 307 recibe
  `false` y limpia el atributo correctamente.

## Repo conventions to follow

- El JS de este proyecto es vanilla, sin build ni transpilación. `assets/js/main.js`
  se sirve tal cual con `<script defer>` desde `_includes/layouts/base.njk`.
- Los comentarios explicativos van **en español**, arriba de la línea que
  justifican, y explican el *porqué*, no el *qué*. Exemplar a imitar —
  `assets/js/main.js:316-318`:
  ```js
    // fill: 'forwards' sostiene el estado final hasta que se cierra el
    // <details>. Sin eso el panel vuelve a su altura natural un frame antes
    // de desaparecer, y el cierre pega un salto.
  ```
- Nombres de variables en español (`abriendo`, `animacion`, `alturaActual`,
  `cerrandose`). Mantener esa convención.

## Steps

1. Abrir `assets/js/main.js`.
2. Localizar las líneas 292-293, que actualmente dicen exactamente:
   ```js
       const abriendo = !item.open;
       if (abriendo) item.open = true;
   ```
3. Reemplazarlas por el bloque de la sección **Target** (5 líneas: 3 de
   comentario + 2 de código + la línea `if`).
4. No tocar nada más del handler.

## Boundaries

- NO tocar `assets/css/main.css`.
- NO tocar el resto del handler del acordeón (`assets/js/main.js:265-330`)
  fuera de las dos líneas indicadas.
- NO "arreglar de paso" el retarget parcial de `paddingTop`/`paddingBottom`/
  `opacity` en la línea 302-304. Es un hallazgo separado y **fuera del alcance
  de este plan**; dejarlo exactamente como está.
- NO agregar dependencias.
- NO cambiar el markup de las FAQ en los `.njk`.
- Si el código de las líneas 292-293 no coincide con lo transcripto arriba
  (drift desde el commit 2424b60), PARAR y reportar en vez de improvisar.

## Verification

- **Mecánica**:
  - `node --check assets/js/main.js` → debe salir sin output y con exit 0.
  - `npx @11ty/eleventy` → debe terminar con `Wrote 18 files`.
- **Feel check** — servir el sitio (`npx @11ty/eleventy --serve --port=8081`;
  **no usar el puerto 8080**, está reservado) y abrir
  `http://localhost:8081/camillas-electricas/premium/`, sección "Preguntas frecuentes":
  - Abrir una FAQ, y **antes de que termine de cerrarse** (240 ms) volver a
    clickear el mismo `<summary>`. El panel debe **revertir y volver a abrirse**,
    arrancando desde la altura a la que estaba. Hoy se cierra igual.
  - Confirmar que el marcador `+` vuelve a rotar a la posición de abierto en
    esa reapertura, sin quedar trabado en `×`.
  - Clickear rápido 5-6 veces seguidas sobre el mismo `<summary>`: el panel
    debe terminar en un estado coherente (abierto o cerrado, nunca a media
    altura ni con `overflow: hidden` pegado). Verificar en DevTools que el
    elemento no quede con `style="overflow: hidden"` residual.
  - En DevTools → panel Animations, bajar la velocidad a 10% y repetir la
    reapertura: la altura debe salir de donde estaba, no saltar a 0 primero.
  - Activar `prefers-reduced-motion: reduce` (DevTools → Rendering → Emulate
    CSS media feature): el acordeón debe volver al comportamiento nativo
    instantáneo del `<details>` y este cambio no debe tener ningún efecto
    (el handler hace `return` temprano en la línea 275).
- **Done when**: un segundo click durante el cierre reabre el panel, y el
  spam de clicks nunca deja el panel a media altura ni con estilos inline
  residuales.
