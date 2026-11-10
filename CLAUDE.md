# LUMA — camillasluma.com

Cliente de Jungle Growth. LUMA vende camillas eléctricas premium, carritos
auxiliares y luminarias LED para consultorios médicos y centros de estética
en Argentina. Contactos del cliente: Marcelo y Micaela Galer.

La web está en vivo (la reestructuración One Shot terminó en sep-2026).
Hoy el trabajo es mantenimiento: blog semanal, ajustes de fichas, SEO/AEO/GEO
y landings para Google Ads.

## Tarsán es la fuente de verdad

Datos del cliente, decisiones, tareas y reuniones viven en Tarsán, no en
este repo. Antes de tocar contenido, consultá el conector:

| Para saber… | Dónde (Tarsán, cliente Luma) |
| --- | --- |
| Qué pasó últimamente | `tarsan_bitacora` (último día y última semana) |
| Specs, qué incluye cada modelo, precios internos | Catálogo y specs (verificado en la web) |
| Paleta, tipografías, tono, qué sí y qué no | Creative Lab / Brief de marca |
| A quién le hablamos (Paula y segmentos) | Creative Lab / Buyer personas |
| Decisiones ya tomadas (precios, showrooms, segmentos) | Decisiones y aprendizajes |
| Hosting, deploy, .htaccess, schema, IndexNow | Web / Stack, hosting y deploy |
| GTM, eventos, código de WhatsApp | Medición y analítica / Plan de medición |
| Voz y correcciones del blog | Blog · voz y correcciones · LUMA |
| Keywords y estrategia | SEO / AEO / GEO / Estrategia, keywords y competencia |

Al terminar:

- Tareas nuevas o cerradas → `tarsan_crear_tarea` / `tarsan_actualizar_tarea`
  (antes, `tarsan_reglas`).
- Resumen de lo hecho → `tarsan_anotar_trabajo` con cliente Luma.
- Un dato o decisión nueva → página de Tarsán, no un `.md` en este repo.

Si el conector de Tarsán no está activo, avisalo antes de seguir.

## Reglas de contenido (no negociables)

- No inventes datos. Lo que no está confirmado queda visible como
  `{{...}}` o `⚠️ A CONFIRMAR`.
- Sin precios publicados: venta por cotización por WhatsApp.
- Garantía: 12 meses para todo (sale de `_data/site.json`; manda el PDF
  oficial). No escribir "2 años en motores".
- Premium NO incluye silla (la silla está solo en el set Gold). No existe
  "LUMA High".
- Showrooms: solo zona (Palermo y Belgrano, CABA), con turno previo, sin
  direcciones.
- NUNCA schema `Review` / `AggregateRating` sobre testimonios mock. Los de
  `luma-testimonios.md` están apagados (`mostrar_testimonios_mock: false`).
- Sin superlativos sin dato, sin competidores por nombre, medidas solo de
  lo que ya figura en la web.
- No tocar `<title>` ni H1 sin motivo. Un solo H1 por página.
- Todo en voseo ("Pedí tu cotización"), sin mezclar con "Contáctanos".

## Pendientes del cliente que siguen abiertos en el código

- `{{HEX_OFICIALES}}`: navy `#0A2956` y azules son aproximados
  (`assets/css/tokens.css`).
- Behind the Nineties: licencia web sin confirmar; hoy cae al fallback
  Georgia (`tokens.css`).
- Reels de Instagram faltantes: las fichas muestran tarjetas placeholder
  ⚠️ (`instagram_reels` en el front matter).
- Congresos: año/edición y tipo de participación sin confirmar
  (`bloque-congresos.njk`).
- Flags apagados en `_data/site.json`: `mostrar_gine_urologia_obstetricia`,
  `mostrar_podologia`.

## Convenciones técnicas

- Eleventy → HTML/CSS/JS estático. Sin CMS. `lang="es-AR"`.
- Header, footer y bloques son componentes en `_includes/components/`.
  Una sola fuente, no copiar entre páginas.
- FAQ: se escriben en `faqs:` del front matter; de ahí salen el acordeón y
  el schema FAQPage. No escribir FAQ en HTML a mano.
- WhatsApp: siempre `{{ whatsappLink }}` o el filtro `waLink` (llevan el
  código de origen de `_data/codigosWa.json`).
- Íconos: `{% icono "nombre" %}` con SVG de `_lib/iconos/`.
- Imágenes: WebP, alt real, lazy, width/height. Originales en
  `_originales/` (no se publican); scripts `npm run galeria`,
  `npm run responsive`, `npm run og`.
- Blog: un `.njk` por artículo en `blog/` con `layout: post.njk`.

## Qué hay en el repo que no es sitio

- `docs/`: transcripciones de fichas técnicas del fabricante usadas en el
  build (ver `docs/README.md`). Si chocan con Tarsán, manda Tarsán.
- `luma-testimonios.md`: testimonios mock, apagados. Referenciado en
  comentarios del HTML.
- `Garantia.pdf`: SÍ se publica (como `/assets/pdf/garantia-luma.pdf`).
- `66680b841a2b4510b405236b73559125.txt`: clave de IndexNow, se publica.
- `.claude/skills/`: skills de animación instaladas en el repo.

## Comandos

- Build: `npm run build` (sale en `_site/`).
- Preview local: `npm run serve` (http://localhost:8080).

## Hosting (Hostinger, desde sep-2026)

- Plan Single, LiteSpeed. YA NO se usa Netlify: no crear `_headers`,
  `_redirects` ni `netlify.toml`.
- Caché, redirects 301, página 404, https y www→sin www viven en
  `.htaccess` (raíz del repo, Eleventy lo copia a `_site/`). Un redirect
  nuevo va ahí.
- LiteSpeed ignora `<If>` y `expr=` en `.htaccess`: usar
  `<FilesMatch>` / `RewriteRule`.
- Publicar: `npm run build`, comprimir el CONTENIDO de `_site/` (incluido
  `.htaccess`) en un zip y subirlo a `public_html` desde el administrador
  de archivos de Hostinger. Hostinger no corre el build. Extraer no borra
  lo viejo: si se da de baja una página, borrarla a mano y sumar el 301.

## Flujo de trabajo

- Cambios en el sitio: mostrá el plan y esperá el OK antes de tocar código.
- Una rama y un PR por cambio. Antes de publicar, `npm run build` sin
  errores y revisión en local.
