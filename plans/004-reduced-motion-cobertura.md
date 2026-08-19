# 004 — Completar la cobertura de prefers-reduced-motion

- **Status**: DONE (aplicado sobre 2424b60)
- **Commit**: 2424b60
- **Severity**: MEDIUM
- **Category**: Accesibilidad
- **Estimated scope**: 1 archivo, ~35 líneas

## Problem

El sitio tiene dos bloques `@media (prefers-reduced-motion: reduce)`
(`assets/css/main.css:2797-2849` y `3010-3032`), pero **cinco elementos que se
mueven quedaron afuera**, y uno de los que sí está listado no aplica por un
bug de especificidad.

### a) Rotación del chevron del dropdown — sin cubrir

```css
/* assets/css/main.css:135-143 — actual */
.dropdown-toggle .arrow-down {
  display: inline-block;
  transition: transform var(--dur-fast) var(--ease-out);
}

.dropdown:hover .arrow-down,
.dropdown:focus-within .arrow-down {
  transform: rotate(180deg);
}
```
El bloque de reduced-motion lista `.main-nav, .dropdown-menu, #backToTop`
(línea 2842), pero `.main-nav` matchea solo el `<nav>`, no este descendiente.
La rotación de 180° sigue animando. Alcanzable también por teclado vía
`:focus-within`.

### b) Tooltip del WhatsApp flotante — sin cubrir

```css
/* assets/css/main.css:977 y :1000 — actual */
  transform: translateY(-50%) translateX(10px);   /* ::before */
  transform: translateY(-50%) translateX(12px);   /* ::after  */
```
Se deslizan a `translateX(0)` en el hover (línea 1019). Ninguno de los dos
pseudo-elementos aparece en ningún bloque de reduced-motion.

### c) Marcador `+` → `×` de la FAQ — sin cubrir

```css
/* assets/css/main.css:2016-2018 y :2744-2747 — actual */
.faq-item[open] summary::after {
  transform: rotate(45deg);
}
.faq-item summary::after {
  transition: transform var(--dur-ui) var(--ease-out);
}
```
`assets/js/main.js:275` sí respeta la preferencia y desactiva la animación de
altura del acordeón — y después el CSS la reintroduce por el marcador.

### d) Escala del color-dot activo — bug de especificidad

```css
/* assets/css/main.css:919-922 — actual */
.color-dot.active {
  border-color: var(--color-principal);
  transform: scale(1.2);
}
/* assets/css/main.css:2715-2717 — actual */
.color-dot.active:active {
  transform: scale(1.1);
}
```
El bloque de reduced-motion neutraliza `.color-dot:active` (línea 2832), con
especificidad (0,2,0). Pero `.color-dot.active:active` tiene (0,3,0) y **gana**,
así que el press sobre el dot seleccionado se sigue moviendo.

### e) Grupos nombrados de view-transition — sin cubrir

```css
/* assets/css/main.css:2870-2887 — actual */
.main-header    { view-transition-name: luma-header; }
.whatsapp-float { view-transition-name: luma-whatsapp; }
#backToTop      { view-transition-name: luma-back-to-top; }
```
El bloque de la línea 3013 anula solo `::view-transition-group(luma-producto-imagen)`.
Los grupos nombrados animan posición **y tamaño** por defecto, así que
`luma-header` sigue morfeando entre navegaciones cuando las dos páginas están
en distinto estado de `data-scrolled`, y `luma-back-to-top` cuando difiere su
visibilidad.

## Target

Criterio, tomado del playbook: reduced-motion significa **menos y más suave, no
cero**. Se conserva todo lo que comunica estado (el `×` de la FAQ abierta, el
dot de color seleccionado, la forma del dot activo) y se elimina únicamente el
*desplazamiento*. Por eso en (c) y (d) se apaga la **transición**, no el
`transform` final.

Agregar al bloque de reduced-motion existente que empieza en la línea 2797,
antes de su `}` de cierre en la línea 2849:

```css
/* target — assets/css/main.css, dentro del bloque de la línea 2797 */

  /* Chevron del dropdown: la rotación es desplazamiento puro. */
  .dropdown:hover .arrow-down,
  .dropdown:focus-within .arrow-down {
    transform: none;
  }

  /* Tooltip del WhatsApp: se conserva el fundido, se elimina el deslizamiento.
     Se mantiene el translateY(-50%) porque no es animación: es el centrado. */
  .whatsapp-float::before,
  .whatsapp-float::after,
  .whatsapp-float:hover::before,
  .whatsapp-float:hover::after {
    transform: translateY(-50%);
  }

  /* El "+" girado a "×" indica que la FAQ está abierta: se conserva el estado
     final y se elimina solo la animación hacia él. */
  .faq-item summary::after {
    transition: none;
  }

  /* Igual con el dot de color: el scale(1.2) marca cuál está elegido. */
  .color-dot {
    transition: none;
  }

  /* (0,3,0) para ganarle a `.color-dot.active:active` de la línea 2715, que
     por especificidad se saltea el `.color-dot:active` de más arriba. */
  .color-dot.active:active {
    transform: scale(1.2);
  }
```

Y agregar al segundo bloque, el que empieza en la línea 3010, antes de su `}`:

```css
/* target — assets/css/main.css, dentro del bloque de la línea 3010 */

  /* Los grupos nombrados morfean posición y tamaño entre documentos.
     El crossfade de opacidad del root se conserva; el desplazamiento no. */
  ::view-transition-group(luma-header),
  ::view-transition-group(luma-whatsapp),
  ::view-transition-group(luma-back-to-top) {
    animation: none;
  }
```

## Repo conventions to follow

- Los dos bloques de reduced-motion ya existen; **extenderlos, no crear un
  tercero**. El primero (línea 2797) cubre el CSS de la sección `MOTION`; el
  segundo (línea 3010) cubre el de `MOTION AVANZADO`. Respetar esa división:
  los ítems (a)-(d) van al primero, el (e) al segundo.
- Comentarios en español explicando el criterio, no la mecánica. Exemplar a
  imitar — `assets/css/main.css:3011-3012`:
  ```css
  /* El crossfade entre páginas es solo opacidad y se mantiene;
     el morfeo de posición de la imagen del producto no. */
  ```
- Indentación de 2 espacios dentro del `@media`, consistente con el resto del
  bloque.
- Evitar `!important` salvo que la especificidad lo exija. En este plan **no
  hace falta en ningún caso**: el bloque está más abajo en el archivo, así que
  a igualdad de especificidad ya gana. El único caso delicado es (d), resuelto
  con especificidad (0,3,0) y no con `!important`.

## Steps

1. Abrir `assets/css/main.css`.
2. Localizar el `}` de cierre del primer bloque de reduced-motion (línea 2849,
   el que cierra el `@media` abierto en la 2797, justo después de la regla
   `.testimonio-carousel-track { transition: none !important; }`).
3. Insertar antes de ese `}` los cinco grupos de reglas del primer bloque
   **Target** (chevron, tooltip WhatsApp, marcador FAQ, `.color-dot`,
   `.color-dot.active:active`).
4. Localizar el `}` de cierre del segundo bloque de reduced-motion (línea 3032,
   el que cierra el `@media` abierto en la 3010, después de la regla del hero).
5. Insertar antes de ese `}` el grupo de `::view-transition-group(...)` del
   segundo bloque **Target**.
6. No modificar ninguna regla existente dentro de los dos bloques.

## Boundaries

- NO tocar `assets/js/main.js`. La cobertura del lado JS ya está bien: la
  preferencia se lee en vivo (líneas 9-10) y la consultan el reveal, el naming
  de view-transitions, el carrusel, el acordeón y los dos autoplay.
- NO modificar las reglas de origen (líneas 135-143, 977, 1000, 2016, 2715,
  2870-2887). Este plan solo agrega neutralizaciones dentro de los `@media`.
- NO agregar un `:hover` gateado por `@media (hover: hover)` al dropdown:
  eso es un hallazgo separado.
- NO agregar sustitutos de color/opacidad al press feedback: también es un
  hallazgo separado.
- NO usar `!important`.
- NO agregar dependencias.
- Si los números de línea no coinciden, localizar los bloques por su texto
  (`@media (prefers-reduced-motion: reduce)`, hay exactamente dos) y verificar
  que el contenido coincide con lo transcripto. Si difiere, PARAR y reportar.

## Verification

- **Mecánica**:
  - `npx @11ty/eleventy` → `Wrote 18 files`.
  - Llaves balanceadas:
    `python -c "import io;s=io.open('assets/css/main.css',encoding='utf-8').read();print(s.count('{')==s.count('}'))"`
    → `True`.
  - Debe seguir habiendo exactamente **dos** bloques de reduced-motion:
    `grep -c "prefers-reduced-motion" assets/css/main.css` → `2`.
- **Feel check** — servir con `npx @11ty/eleventy --serve --port=8081`
  (**no usar el 8080**, está reservado), y activar
  DevTools → Rendering → *Emulate CSS media feature prefers-reduced-motion:
  reduce*. Con la emulación **activa**, verificar en
  `http://localhost:8081/camillas-electricas/premium/`:
  - Hover sobre "Camillas" en el header: el menú aparece (fundido, sin
    deslizarse) y el chevron **queda apuntando hacia arriba sin girar animado**.
  - Hover sobre el botón de WhatsApp: el tooltip aparece por opacidad, **sin
    deslizarse** hacia la izquierda, y sigue centrado verticalmente (si queda
    descolgado, el `translateY(-50%)` se perdió).
  - Abrir una FAQ: el `+` **aparece ya rotado como `×`**, sin animar el giro.
    Que el `×` no aparezca es un error: se perdió el estado, no solo el movimiento.
  - Mantener apretado un swatch de color **ya seleccionado**: no debe encogerse.
    Sin el fix se achica de `1.2` a `1.1`. Es la comprobación del bug de
    especificidad.
  - Navegar de `/camillas-electricas/` a una ficha: el header **no debe
    desplazarse ni cambiar de tamaño** durante la transición (el crossfade de
    opacidad de la página sí se conserva).
  - Con la emulación **desactivada**, repetir los cinco puntos y confirmar que
    todo el movimiento volvió: es la comprobación de que no se rompió el
    comportamiento por defecto.
- **Done when**: con reduced-motion activo no queda ningún desplazamiento en
  los cinco puntos, los indicadores de estado (`×` de la FAQ, `scale(1.2)` del
  dot elegido) siguen visibles, y con la preferencia desactivada todo el
  movimiento original sigue igual que antes.
