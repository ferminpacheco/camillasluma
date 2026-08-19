# Planes de motion — LUMA

Generados por la skill `improve-animations` sobre el commit `2424b60`.
Cada plan es autocontenido: incluye el código actual verbatim, los valores
exactos de destino y su propio feel check. Un ejecutor sin contexto de la
conversación que los originó debería poder aplicarlos.

## Planes

| # | Título | Severidad | Categoría | Archivos | Status |
| --- | --- | --- | --- | --- | --- |
| [001](001-faq-reabrir-durante-cierre.md) | Permitir reabrir una FAQ mientras se está cerrando | HIGH | Interrumpibilidad | `assets/js/main.js` | **DONE** |
| [002](002-testimonios-indice-sin-tope.md) | Acotar el índice del carrusel de testimonios | HIGH | Interrumpibilidad | `assets/js/main.js` | **DONE** |
| [003](003-carousel-dots-transicion-pisada.md) | Recuperar la transición de los dots del carrusel | HIGH | Cohesión / regresión | `assets/css/main.css` | **DONE** |
| [004](004-reduced-motion-cobertura.md) | Completar la cobertura de prefers-reduced-motion | MEDIUM | Accesibilidad | `assets/css/main.css` | **DONE** |

## Estado

Los cuatro planes fueron aplicados y verificados mecanicamente sobre `2424b60`.
Quedan pendientes los feel checks que requieren ojo humano (ver abajo).

## Orden recomendado

**003 → 004 → 001 → 002**

El criterio es agrupar por archivo para no pisarse, y dejar para el final los
dos que exigen más razonamiento sobre estado:

1. **003** y **004** tocan solo `assets/css/main.css` y son puramente aditivos
   (agregan reglas, no modifican las existentes). Son los de menor riesgo.
2. **001** y **002** tocan solo `assets/js/main.js` y reemplazan lógica
   existente. Requieren el feel check más atento.

## Dependencias

Ninguna. Los cuatro planes son independientes y se pueden aplicar en cualquier
orden o en paralelo.

Dos advertencias de coordinación si se ejecutan en paralelo con distintos agentes:

- **001 y 002 editan el mismo archivo** (`assets/js/main.js`) en regiones
  distintas y sin solapamiento (líneas ~292 y ~448). Aun así, aplicarlos en
  ramas separadas y mergear puede generar conflicto de contexto: preferible
  secuencial.
- **003 y 004 editan el mismo archivo** (`assets/css/main.css`), también en
  regiones distintas (~2692 y ~2849 / ~3032). El 003 inserta líneas antes de
  la zona que toca el 004, así que **si se aplica 003 primero, los números de
  línea del 004 se corren**. Por eso el 004 indica localizar sus bloques por
  texto y no por número de línea.

## Fuera de alcance

Esta tanda cubre 4 de los 21 hallazgos de la auditoría. Los otros 17 quedaron
sin plan por decisión explícita, no por descarte. Los de mayor leverage entre
los que quedaron:

- Hover sin gatear por `(hover: hover) and (pointer: fine)` en el dropdown y su
  chevron (`main.css:123`, `:140`) — los únicos dos sin gatear del archivo.
- Falta de press feedback en `.faq-item summary`, `.hub-producto-card`,
  `.linea-card` y `.relacionado-card`.
- Hover sobre elementos no clickeables: `.valor-item` (`main.css:365`) y
  `.camilla-img` (`main.css:433`).
- El carrusel de producto no reinicia el autoplay al usar las flechas
  (`main.js:388-395`), a diferencia del de testimonios.
- Retarget parcial del acordeón: solo interpola `height`, no `padding` ni
  `opacity` (`main.js:302-304`).
- `EASE_OUT`, `DUR_ACORDEON` y `TRANSITION_MS` duplicados en JS como segunda
  fuente de verdad de los tokens de `tokens.css`.
- `.btn`, `.btn-primario` y `.btn-secundario` en `404.njk` no tienen **ninguna**
  regla CSS en el proyecto.

Sin verificar por no ser juzgable desde el código: si el offset lateral de 2,5%
alcanza para separar las dos fotos en el crossfade del carrusel de producto, o
si conviene enmascarar el solapamiento con `filter: blur(2px)`.
