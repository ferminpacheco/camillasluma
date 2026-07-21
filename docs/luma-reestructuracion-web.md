# LUMA — Reestructuración Web (One Shot)
## Especificación de estructura para build

> **Qué es este documento:** el plan y el paso a paso para reconstruir `camillasluma.com`, pasando de una web *one-page* (todo son anclas `#premium`, `#ginecologica` sobre una sola URL) a un **sitio con arquitectura real**. Está escrito para que lo ejecute Claude Code sobre el código fuente.
>
> **Para el agente que ejecuta (Claude Code):**
> 1. Leé primero el repositorio actual para entender la base (HTML/CSS/JS puro, sin CMS ni theme).
> 2. Respetá los bloques marcados con `⚠️ A CONFIRMAR` y `{{PLACEHOLDER}}`: **no inventes** esos datos. Dejalos como placeholder visible o variable de configuración hasta que el cliente los confirme.
> 3. Seguí el orden de ejecución de la sección 12.
> 4. El contenido fino (specs de producto, claims, direcciones) sale de las fuentes citadas en la sección 0. Este doc incluye una versión condensada para que puedas construir sin depender de otros archivos.
>
> **Alcance:** este build cubre estructura, capa técnica, capa de conversión y reglas de contenido. **Fuera de alcance:** producción de contenido de blog, redacción de artículos comparativos y campañas de Google Ads (eso es la etapa mensual). Acá dejamos las plantillas y la casa lista para cargar.

---

## 0. Contexto y fuentes

**Marca:** LUMA — Equipamiento Médico Estético / Camillas Eléctricas Premium. Ticket alto, venta por congresos, Instagram y dos consultorios que funcionan como showroom con turno previo.

**Público (buyer persona):** dueña/o de centro de medicina estética premium en CABA (perfil "Paula": dermatóloga, 39-48, perfeccionista, investiga y compara, necesita ver la camilla físicamente antes de decidir). Especialidades a las que se le vende: cirugía plástica, dermatología, ginecología, medicina estética y centros de estética.

**Estado actual de la web (relevado):**
- Es una sola URL. Toda la "navegación" son anclas.
- Faltan dos productos que sí existen en la cartera: **LUMA One** y **LUMA Cart Gold** (el menú actual tiene incluso un ítem vacío donde iría One).
- Imágenes: la mayoría tiene nombre aceptable (`Luma_ginecologica.png`, `Luma_cart.png`, `Luma_tech.png`, `Luma_luminaria.png`); la de Premium es `A2.png` (renombrar). Todas necesitan `alt` real, compresión y WebP.
- "Nosotros" es un ancla sin contenido real detrás.
- Contacto por Gmail (`camillasluma@gmail.com`), ubicación genérica "Buenos Aires, Argentina" (los showrooms no aparecen), formulario "Enviar Mensaje" sin medición, y mezcla de trato ("Contáctanos" con "Completá").
- **A favor:** HTML/CSS/JS puro → libertad total para intervenir.

**Fuentes de contenido (autoridad):**
- Cartera de productos (specs, precios, disponibilidad).
- Guía de marca (paleta, tipografías, claims, showrooms, garantía).
- Buyer persona (tono, CTAs por intención, segmentación).

---

## 1. Decisiones tomadas y placeholders a confirmar

| # | Decisión | Resolución para este build |
|---|---|---|
| 1 | Profundidad de arquitectura | **Hubs de categoría + páginas de producto** (arquitectura profunda). |
| 2 | ¿Construir One y Cart Gold? | **Sí.** One se arma completo (tiene precio y llena el segmento accesible). **Cart Gold** se arma con precio e imagen como `{{PLACEHOLDER}}`. |
| 3 | Ubicación de Ginecológica | Bajo el hub de camillas: `/camillas-electricas/ginecologica/`. |
| 4 | Slugs | Los de la sección 3. |
| 5 | Mensaje de garantía | `⚠️ A CONFIRMAR` — conflicto: guía de marca dice "1 año oficial"; propuesta dice "1 año sillas / 2 años motores". **No escribir un valor definitivo hasta confirmar con el cliente.** |
| 6 | Showrooms | Direcciones conocidas (sección 7.2). Barrio/CP exacto para schema = `⚠️ A CONFIRMAR`. |
| 7 | Mail de dominio + handle de IG | `⚠️ A CONFIRMAR`. Usar `{{EMAIL_DOMINIO}}` y `{{IG_HANDLE}}`. |
| 8 | Enfoque técnico | **Recomendado:** static site generator liviano (Astro o Eleventy) que compila a HTML plano, con partials compartidos para header/footer/bloques. Preserva el "sin CMS ni theme" (output = HTML/CSS/JS estático). *Claude Code valida contra el repo actual antes de decidir; si se mantiene vanilla, usar un mecanismo de includes para no duplicar header/footer en 14 páginas.* |
| 9 | Blog | **Estructura vacía + plantillas** (hub + post). Contenido = etapa mensual. |

### Placeholders que NO se deben inventar
- `{{GARANTIA}}` — texto y plazos de garantía.
- `{{EMAIL_DOMINIO}}` — ej. `contacto@camillasluma.com` (a confirmar).
- `{{IG_HANDLE}}` — handle real de Instagram (el `centromedicolist` visto en un mockup es placeholder, no el real).
- `{{CART_GOLD_PRECIO}}` y `{{CART_GOLD_IMG}}`.
- `{{ONE_IMG}}` — imagen de LUMA One (no existe en la web actual).
- `{{SHOWROOM_CP_PALERMO}}` / `{{SHOWROOM_CP_BELGRANO}}` — para el schema local.
- `{{HEX_OFICIALES}}` — los hex de la paleta son muestreados; confirmar contra brand kit.

---

## 2. Stack técnico y organización

**Principio:** salida estática (HTML/CSS/JS), sin CMS ni theme. Header, footer y bloques reutilizables como **componentes/partials compartidos** (una sola fuente de verdad, no copiar 14 veces).

**Estructura de carpetas sugerida** (adaptar al enfoque elegido):

```
/
├── index.html                         → Home
├── camillas-electricas/
│   ├── index.html                     → Hub camillas
│   ├── premium/index.html
│   ├── one/index.html
│   └── ginecologica/index.html
├── carritos-auxiliares/
│   ├── index.html                     → Hub carritos
│   ├── luma-cart/index.html
│   ├── luma-tech/index.html
│   └── cart-gold/index.html
├── luminarias/index.html
├── nosotros/index.html                → incluye #garantia y #showrooms
├── blog/
│   ├── index.html                     → Hub blog
│   └── [slug]/index.html              → plantilla de post (scaffold)
├── contacto/index.html
├── gracias/index.html
├── robots.txt
├── sitemap.xml
├── 404.html
├── /assets/ (css, js, fonts, img)
└── /components/ (header, footer, cta, garantia, reviews, showroom, whatsapp)
```

**Componentes reutilizables** (se invocan desde varias plantillas): `header`, `footer`, `breadcrumb`, `cta-doble`, `bloque-garantia`, `bloque-reviews`, `bloque-showroom`, `whatsapp-flotante`.

**Sistema de estilos (de la guía de marca):**
- Paleta (hex aproximados, `{{HEX_OFICIALES}}` a confirmar): navy `#0A2956` (primario/color madre), azul acero `#7195A9` (acento display), gris `#787A79`, gris claro `#D9DDE2`, blanco `#FFFFFF`.
- Tipografías: **Behind the Nineties** para títulos, siempre en MAYÚSCULAS (`⚠️ A CONFIRMAR` licencia web; si no está disponible, definir fallback) + **Poppins** para cuerpo (Google Fonts, sin fricción).
- Recurso de marca: la **onda / tilde (~)** como separador y sello gráfico reutilizable.

---

## 3. Mapa de URLs (arquitectura — 14 URLs)

| URL | Plantilla | A qué búsqueda apunta |
|---|---|---|
| `/` | Home (única) | Marca + "camillas eléctricas premium" |
| `/camillas-electricas/` | Hub | "camillas eléctricas para estética / consultorio" |
| `/camillas-electricas/premium/` | Producto | "camilla eléctrica 3 motores premium" |
| `/camillas-electricas/one/` | Producto | "camilla eléctrica accesible / económica" |
| `/camillas-electricas/ginecologica/` | Producto | "camilla ginecológica eléctrica" (alta intención) |
| `/carritos-auxiliares/` | Hub | "carrito auxiliar para estética" |
| `/carritos-auxiliares/luma-cart/` | Producto | "mesa / carrito auxiliar estético" |
| `/carritos-auxiliares/luma-tech/` | Producto | "carrito para aparatología estética" |
| `/carritos-auxiliares/cart-gold/` | Producto | "carrito auxiliar premium dorado" |
| `/luminarias/` | Producto | "lámpara LED para consultorio estético" |
| `/nosotros/` | Única | Marca + E-E-A-T + garantía + showrooms |
| `/blog/` | Única (hub) | Motor SEO/AEO (se llena en el mensual) |
| `/contacto/` | Única | Marca + contacto |
| `/gracias/` | Única (sistema) | Disparador de conversión (`noindex`) |

**Regla de plantillas:** 2 plantillas que se repiten cambiando contenido/imágenes (**7 productos** + **2 hubs**) y **5 páginas únicas** (home, nosotros, blog, contacto, gracias). La franja de **reviews es un bloque de la Home**, no una URL.

---

## 4. Shell global (en todas las páginas)

**Header sticky:** logo LUMA (con la onda ~) · nav: Inicio · Camillas ▾ (Premium / One / Ginecológica) · Carritos ▾ (Cart / Tech / Cart Gold) · Luminarias · Nosotros · **CTA fijo "Pedí tu cotización"**.

**WhatsApp flotante:** número `+54 9 11 3250-8970`, con **tracking de click** (evento de conversión).

**Footer** (repetido): navegación completa · NAP consistente (mail de dominio `{{EMAIL_DOMINIO}}` · WhatsApp · las dos direcciones de showroom) · mini-bloque garantía → `/nosotros/#garantia` · Instagram `{{IG_HANDLE}}` · línea legal.

**En todas las internas:** breadcrumb visible + `BreadcrumbList`.

**Meta base por página (obligatorio, uno por búsqueda):** `title`, `meta description`, `canonical`, Open Graph + Twitter card, `lang="es-AR"`. Favicon global.

**Schema global:** `Organization` (logo, `sameAs` → IG) + `WebSite`, inyectados en todas las páginas vía el componente de head.

---

## 5. Plantilla PRODUCTO (7 URLs)

**La usan:** Premium · One · Ginecológica · Luma Cart · Luma Tech · Cart Gold · Luminarias.
Misma estructura siempre; cambian textos, specs, imágenes y FAQ. Bloques `(opcional)` se renderizan solo si aplican.

**Bloques (en orden):**
1. **Breadcrumb** — Inicio › Categoría › Producto.
2. **Hero de producto** — H1 con keyword · bajada · galería (varias vistas) · badges (garantía · envíos a todo el país · silla incluida *(opcional, solo camillas)*) · **CTA doble** ("Pedí tu cotización" / "Agendá una visita al showroom").
3. **Descripción / para quién es** — párrafo + especialidad/uso (insumo AEO).
4. **Características y specs** — lista estructurada (motores, colores, medidas, materiales). Sale de la cartera.
5. **Diferenciales + posicionamiento** — claims de marca + copy comparativo frente al mercado (importadas italianas arriba, fábricas nacionales tipo Marziano/Reeducar abajo, LUMA en el medio). *Acá vive el ángulo comparativo, sin URL propia.*
6. **Garantía** — bloque con el argumento central `{{GARANTIA}}` → enlaza a `/nosotros/#garantia`.
7. **Testimonio contextual** *(mockup — sin schema `Review` hasta reseñas reales)*.
8. **FAQ del producto** — formato pregunta-respuesta (lo que consumen las IAs) → `FAQPage`.
9. **CTA de cierre** — "Vení a probarla" (showroom) + cotización.
10. **Productos relacionados** — cross-sell (ej. Premium → Cart · Tech · Luminaria).

**Schema:** `Product` + `Offer` + `Brand` + garantía + `FAQPage` + `BreadcrumbList`.
**Nota:** Luminarias usa esta misma plantilla aunque no sea camilla, y va a top-level (sin hub de "iluminación").

### 5.1 Data map por producto (condensado — fuente: cartera + relevamiento)

| Producto | URL | Keyword principal | Specs clave | Precio | Imagen |
|---|---|---|---|---|---|
| **LUMA Premium** | `/camillas-electricas/premium/` | camilla eléctrica premium 3 motores | 3 motores (altura/respaldo/apoyapiernas), botonera de pie, **silla profesional + cobertor de cristal**, colores blanco/beige/negro + dorado | USD 3.240 + IVA (promo) · lista 4.000 | renombrar `A2.png` → `camilla-electrica-luma-premium.webp` |
| **LUMA One** | `/camillas-electricas/one/` | camilla eléctrica accesible 3 motores | 3 motores (altura/respaldo/apoyapiernas), opción más accesible | USD 2.400 + IVA (promo) · lista 3.000 | `{{ONE_IMG}}` — no existe, pedir/generar |
| **LUMA Ginecológica** | `/camillas-electricas/ginecologica/` | camilla ginecológica eléctrica | 3 motores, **pierneras ajustables y removibles** (doble uso), bandeja extraíble, iluminación LED en base, comando de mano | USD 3.240 + IVA (promo) · lista 4.000 · 19% off | `Luma_ginecologica.png` → WebP |
| **LUMA Cart** | `/carritos-auxiliares/luma-cart/` | carrito auxiliar para estética | varios niveles, ruedas, diseño curvo minimalista, superficie de fácil limpieza | USD 390 + IVA | `Luma_cart.png` → WebP |
| **LUMA Tech** | `/carritos-auxiliares/luma-tech/` | carrito para aparatología estética | estructura reforzada, manija, aperturas frontales, ruedas con traba, apertura trasera para cables, zapatilla de enchufes integrada | USD 550 + IVA | `Luma_tech.png` → WebP |
| **LUMA Cart Gold** | `/carritos-auxiliares/cart-gold/` | carrito auxiliar premium dorado | 3 niveles, cajón central, ruedas, acabado dorado | `{{CART_GOLD_PRECIO}}` | `{{CART_GOLD_IMG}}` |
| **Luminaria LED** | `/luminarias/` | lámpara LED para consultorio estético | intensidad regulable, luz cálida/blanca, altura ajustable, colores blanco/negro, tamaños grande/mediano | USD 102 + IVA · **`⚠️` sin stock, ingreso ~2 meses** | `Luma_luminaria.png` → WebP |

> **Precios:** son sensibles al tiempo y promocionales. Mostrarlos como "consultar / a partir de" en la web (venta por cotización) y `⚠️ A CONFIRMAR` vigencia con el cliente antes de publicarlos.

---

## 6. Plantilla HUB DE CATEGORÍA (2 URLs)

**La usan:** `/camillas-electricas/` · `/carritos-auxiliares/`.

**Bloques (en orden):**
1. **Breadcrumb.**
2. **Hero de categoría** — H1 con head-term (ej. "Camillas eléctricas premium para estética y consultorios") · bajada · imagen/collage de la línea · CTA.
3. **Intro de categoría** — qué resuelve la línea y para quién (párrafo AEO).
4. **Grilla de productos** — tarjetas (imagen · nombre · 1 línea · "Ver detalle") → a cada ficha.
5. **Comparador interno** — mini-tabla entre los productos de la línea (ej. Premium vs One vs Ginecológica: motores · uso · para quién). Captura long-tail y ayuda a decidir.
6. **Posicionamiento frente al mercado** — copy comparativo (importadas / nacionales / LUMA).
7. **Diferenciales de la línea** — garantía · silla · envíos.
8. **FAQ de categoría** → `FAQPage`.
9. **CTA de cierre** — cotización + showroom.

**Schema:** `BreadcrumbList` + `FAQPage` + `ItemList` (la grilla).

---

## 7. Páginas únicas

### 7.1 HOME (`/`)
1. **Hero** — H1 de marca · bajada · imagen de consultorio · **CTA "Pedí tu cotización" + "Ver modelos"**.
2. **3 value props** — Precisión tecnológica · Versatilidad total · Comodidad superior (reescritas en voseo).
3. **Líneas de producto** — bloques Camillas / Carritos / Luminarias → a los hubs.
4. **Modelos destacados** — grilla de productos → a las fichas.
5. **★ Reviews / prueba social (mockup)** — franja de 3 tarjetas (avatar · nombre · especialidad + centro/barrio · 5 estrellas · cita corta) · carrusel en mobile. **Placeholder ahora; reales después. Sin `Review`/`AggregateRating` hasta que sean reseñas reales.**
6. **Garantía / confianza** — bloque corto (garantía · envíos a todo el país · silla incluida) → `/nosotros/#garantia`.
7. **Showroom "Vení a probarla"** — empuja a agendar visita → `/nosotros/#showrooms`.
8. **Banda de posicionamiento** — "Marca la diferencia en tu clínica" reescrita.
9. **CTA final** — cotización + WhatsApp.

### 7.2 NOSOTROS (`/nosotros/`) — absorbe garantía + showrooms
1. **Breadcrumb.**
2. **Hero** — quiénes son LUMA + propósito (tecnología médica + elegancia + minimalismo).
3. **Historia / propuesta de valor** — por qué LUMA, diferenciales, trayectoria. *(Acá entra, si el cliente confirma, una línea de "dónde encontrarnos / congresos" — `⚠️ A CONFIRMAR` en qué congresos expone LUMA.)*
4. **★ Garantía — ancla `#garantia`** — `{{GARANTIA}}` + respaldo postventa + servicio técnico, con marcado.
5. **★ Showrooms — ancla `#showrooms`** — las dos ubicaciones, "Vení a probarla", agendar turno, mapa embebido por cada una:
   - **Palermo:** Av. Santa Fe 3312, 6.º piso — CABA · `{{SHOWROOM_CP_PALERMO}}`
   - **Belgrano:** Av. Cabildo 642, 6.º piso, of. 603 — CABA · `{{SHOWROOM_CP_BELGRANO}}`
6. **Prueba social** — testimonios + centros que ya trabajan con LUMA (estructura, se llena con reales).
7. **CTA de cierre** — agendar visita + cotización.

**Schema:** `Organization` · `LocalBusiness` ×2 (uno por showroom) · garantía.
**Nota:** garantía y showrooms se pierden como URL propia pero **conservan schema y ancla** (`#garantia`, `#showrooms`). Los CTA de todo el sitio enlazan a esas anclas.

### 7.3 BLOG — HUB (`/blog/`)
1. **Breadcrumb.**
2. **Hero del blog** — título + bajada (recursos para el profesional que elige equipamiento).
3. **Post destacado.**
4. **Grilla de posts** — imagen · categoría · título · extracto · fecha (vacía/placeholder al inicio).
5. **Categorías / filtros** — por especialidad y por tema (comparativas · criterios de elección · specs explicadas).

**Schema:** `Blog` / `CollectionPage`.
**+ Scaffold de plantilla de post** (`/blog/[slug]/`): H1 · meta · cuerpo · FAQ · autor · fecha · CTA · schema `BlogPosting` + `FAQPage`. **Contenido = etapa mensual.**

### 7.4 CONTACTO (`/contacto/`)
1. **Breadcrumb.**
2. **Hero** — "Hablá con LUMA" / asesoría personalizada.
3. **Formulario real** — campos: nombre · email · teléfono/WhatsApp · **especialidad (select)** · centro · **producto de interés (select)** · mensaje → envía a `{{EMAIL_DOMINIO}}` → **redirige a `/gracias/`**.
4. **Canales directos** — WhatsApp · mail de dominio · horario (Lun a Vie, 8 a 17 hs).
5. **Showrooms (resumen)** → link a `/nosotros/#showrooms`.
6. **CTAs por intención** — cotización / showroom / asesor.

**Schema:** `ContactPage`. **El submit = evento de conversión medible (vía `/gracias/`).**

### 7.5 GRACIAS (`/gracias/`) — sistema
1. **Confirmación** — "Recibimos tu consulta".
2. **Qué sigue / tiempos de respuesta.**
3. **Mientras tanto** — links a productos · showrooms · WhatsApp directo.

**Función:** dispara el evento de conversión limpio en GA4/GTM. **`noindex`** (no se indexa).

---

## 8. Capa técnica (SEO / AEO / GEO)

- **`robots.txt`** — permitir explícitamente crawlers de IA: `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended` (además de los buscadores tradicionales) + referencia al sitemap. Sin esto, la marca es invisible para los modelos.
- **`sitemap.xml`** — generado con las 14 URLs (excluir `/gracias/`) y enviado a Search Console.
- **Meta por página** — `title` y `description` únicos por búsqueda, `canonical`, OG/Twitter, jerarquía correcta H1 → H2 → H3 (un solo H1 por página).
- **Imágenes** — renombrado descriptivo (ej. `A2.png` → `camilla-electrica-luma-premium.webp`), `alt` real, atributos `width/height`, `loading="lazy"`, compresión y WebP.
- **Core Web Vitals** — minificar CSS/JS, `defer` en JS, `preload` de fuentes, imágenes optimizadas. Al ser estático, control total.
- **Sistema** — `404.html` con navegación, favicon, `lang="es-AR"`.

### 8.1 Schema map (resumen)

| Schema | Dónde |
|---|---|
| `Organization`, `WebSite` | Global |
| `BreadcrumbList` | Todas las internas |
| `Product` + `Offer` + `Brand` + garantía | Cada ficha de producto |
| `ItemList` | Grillas de hub |
| `FAQPage` | Fichas, hubs, posts |
| `LocalBusiness` ×2 | `/nosotros/` (showrooms) |
| `ContactPage` | `/contacto/` |
| `Blog` / `BlogPosting` | `/blog/` y posts |
| `Review` / `AggregateRating` | **Solo cuando haya reseñas reales.** No marcar sobre placeholders. |

---

## 9. Arquitectura de conversión

Hoy no hay nada medible. Definimos:

- **CTA principal:** "Pedí tu cotización" → formulario → `/gracias/`.
- **CTAs secundarios por intención:** "Agendá una visita al showroom" (→ `/nosotros/#showrooms`) y "Hablá con un asesor" (WhatsApp).
- **GA4 + Google Tag Manager** instalados desde el día uno (para tener histórico cuando arranque la pauta).
- **Eventos de conversión medibles:**
  - `form_submit` (vía llegada a `/gracias/`).
  - `whatsapp_click` (WhatsApp flotante + botones).
  - `showroom_click` (click en "Agendá una visita").
- Todo queda cableado para conectarse a Google Ads en la etapa 2 → optimizar hacia leads reales, no hacia clicks.

---

## 10. Reglas de contenido

- **Voseo unificado** en todo el sitio. Eliminar la convivencia "Contáctanos/Contactá" y "Completá". Todo en vos ("Pedí", "Agendá", "Contactanos", "Completá").
- **Garantía como argumento central** — `{{GARANTIA}}`, escrita y con schema. `⚠️` **No publicar plazos hasta unificar el mensaje con el cliente** (1 año vs. 1 año sillas / 2 años motores).
- **Posicionamiento explícito frente al mercado** — importadas italianas (más caras) / fábricas nacionales Marziano, Reeducar (más baratas, calidad y diseño inferiores) / **LUMA en el medio con la mejor relación**. Este copy vive en hubs y fichas, no en URL propia.
- **Claims de marca disponibles** (guía de marca): diseño minimalista/elegante/profesional · acabados premium · garantía oficial · silla de cortesía incluida · envíos a todo el país. Tagline: *"Una camilla que eleva tu espacio y tu servicio."*
- **FAQs en formato pregunta-respuesta** en fichas, hubs y posts (formato AEO/GEO).
- **Reviews (mockup):** diseño ahora con contenido placeholder; reseñas reales y schema después (ideal 2-3 antes de lanzar). **Nunca schema `Review` sobre testimonios inventados** (riesgo de penalización).

---

## 11. Redirects y compatibilidad

- La home (`/`) se mantiene. No hay URLs viejas indexadas que romper (era una sola).
- Agregar un **script de redirección de hash** por si alguien tiene guardado un ancla vieja:
  - `#premium` → `/camillas-electricas/premium/`
  - `#ginecologica` → `/camillas-electricas/ginecologica/`
  - `#accesorios` (así se llamaba Cart) → `/carritos-auxiliares/luma-cart/`
  - `#tech` → `/carritos-auxiliares/luma-tech/`
  - `#luminaria` → `/luminarias/`
  - `#nosotros` → `/nosotros/` · `#contacto` → `/contacto/`

---

## 12. Orden de ejecución (fases para Claude Code)

1. **Setup** — decidir enfoque técnico (sección 1, punto 8), crear estructura de carpetas, sistema de estilos con la marca (paleta, tipografías, onda ~), y los componentes reutilizables (header, footer, WhatsApp, cta-doble, garantía, reviews, showroom).
2. **Arquitectura + navegación** — crear las 14 URLs, header/footer con links reales, breadcrumbs. Migrar el contenido existente de la web actual a las nuevas fichas y hubs.
3. **Plantillas** — plantilla de producto (cargar los 7 con el data map de 5.1), plantilla de hub (los 2), y las 5 páginas únicas.
4. **Capa técnica** — `robots.txt` (con crawlers de IA), `sitemap.xml`, schema por tipo de página, renombrado + optimización de imágenes, meta/titles/canonicals, CWV, `404`, favicon.
5. **Conversión** — formulario de contacto → `/gracias/`, CTAs por intención, GA4 + GTM, eventos (`form_submit`, `whatsapp_click`, `showroom_click`).
6. **Secciones de confianza** — Nosotros con `#garantia` + `#showrooms` (`LocalBusiness` ×2), bloque de reviews (mockup), scaffold de blog (hub + plantilla de post).
7. **QA final** — sección 13.

---

## 13. QA / checklist de cierre

- [ ] Las 14 URLs resuelven y son navegables desde el header/footer.
- [ ] Un solo H1 por página; jerarquía de encabezados correcta.
- [ ] `title` + `description` únicos por página.
- [ ] Schema válido por tipo de página (validar con Rich Results Test). **Sin `Review` sobre placeholders.**
- [ ] `robots.txt` permite los crawlers de IA + referencia al sitemap; `sitemap.xml` correcto.
- [ ] Todas las imágenes: nombre descriptivo, `alt`, WebP, `lazy`, `width/height`.
- [ ] Core Web Vitals en verde (mobile).
- [ ] Formulario envía a `{{EMAIL_DOMINIO}}` y redirige a `/gracias/`; `/gracias/` con `noindex`.
- [ ] GA4/GTM cargando; los 3 eventos de conversión disparan.
- [ ] Voseo unificado en todo el sitio; sin "Contáctanos"/"Completá" mezclados.
- [ ] Script de redirección de hash funcionando.
- [ ] Todos los `{{PLACEHOLDER}}` y `⚠️ A CONFIRMAR` resueltos o marcados visiblemente como pendientes (garantía, CP de showrooms, mail, IG, precio/imagen de Cart Gold, imagen de One).
- [ ] Mobile: navegación, dropdowns, carruseles y CTAs funcionan.

---

*Documento generado por Jungle Growth para el build de `camillasluma.com` (etapa One Shot). Los datos de producto, precios y direcciones deben verificarse con el cliente antes de publicarse.*
