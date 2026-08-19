# Sección "Congresos" en página Nosotros — LUMA

> **Para:** Claude Code (build de camillasluma.com)
> **Objetivo de negocio:** mostrar la trayectoria de LUMA en los 4 congresos médicos donde participó Luma. Esto humaniza la marca y respalda específicamente la segmentación por especialidad que ya se usa en SEO/Ads — cada congreso corresponde a una especialidad médica distinta targeteada por la cuenta.

---

## 1. Ubicación

- **Página Nosotros**: sección completa, con los 4 módulos de congreso (ver sección 4).
- **Home (opcional, evaluar con Segundo antes de implementar)**: teaser corto de 2-3 fotos + link "Conocé nuestra trayectoria" hacia la sección en Nosotros. No implementar el teaser sin confirmación — la prioridad de home es la jerarquía de CTA ya definida (cotizar / agendar showroom), no diluirla.

---

## 2. Los 4 congresos (info verificada)

| Congreso | Qué es | Especialidad que respalda | Dato de peso para copy |
|---|---|---|---|
| **RADLA** | Reunión Anual de Dermatólogos Latinoamericanos | Dermatología | Uno de los congresos de dermatología más grandes de la región — reúne dermatólogos de 15 países latinoamericanos |
| **BAAS** (BAAS International Congress) | El congreso de medicina estética en español más grande de América | Medicina estética / centros de estética / ginecoestética | Más de 300 disertantes, 7 auditorios simultáneos |
| **Masterhub** | Congreso de referencia en rejuvenecimiento facial no quirúrgico de Latinoamérica, dirigido por el Dr. Fernando Felice | Medicina estética facial | Único evento de la región con disección cadavérica en vivo |
| **The Global Plastic Surgery Congress** | Organizado por la ASPS (American Society of Plastic Surgeons), en alianza con SACPER | Cirugía plástica | Primer congreso que la ASPS realizó fuera de Estados Unidos |

**Regla de copy:** los datos de peso de la tabla están verificados contra fuentes públicas (sitios oficiales de cada congreso / comunicado de ASPS), pero **no inventar ni agregar más superlativos**. En particular:
- **No escribir que LUMA es "la única" marca presente en estos congresos** sin confirmación explícita — no se verificó si la competencia (Marziano, Reeducar, importadores de italianas) también expone ahí.
- **No afirmar categoría de participación** (expositor con stand vs. asistente) hasta que se confirme — ver sección 6, pendientes.

---

## 3. Estructura de datos e imágenes

**No se arma un JSON de curación manual como en la sección de reels.** En este caso el contenido son archivos locales, no URLs externas. Claude Code debe:

1. Buscar dentro de la carpeta `/images/` (raíz del proyecto) una subcarpeta por congreso, usando exactamente estos slugs:

```
/images/radla/
/images/baas/
/images/masterhub/
/images/the-global-plastic-surgery-congress/
```

2. **Enumerar dinámicamente** los archivos dentro de cada carpeta (no hardcodear nombres de archivo — el contenido se va a ir agregando/reemplazando con el tiempo simplemente soltando archivos ahí).
3. Aceptar tanto imágenes (`.jpg`, `.jpeg`, `.png`, `.webp`, `.heic`).
4. **Orden de visualización dentro de cada módulo:** si los archivos tienen prefijo numérico (`01-foto.jpg`, `02-video.mp4`), respetar ese orden. Si no lo tienen, orden alfabético por defecto. (Convención a comunicar al equipo: usar prefijos numéricos para controlar el orden curado.)
5. **Regla de renderizado:** si la carpeta de un congreso no existe o está vacía, **ese módulo específico no se renderiza** — ni heading, ni contenedor vacío. Los otros 3 módulos igual se muestran con normalidad. Mismo criterio que en la sección de reels: nunca mostrar un bloque roto o vacío.

---

## 4. Markup HTML

Un módulo por congreso, repetido 4 veces (o menos, según la regla de renderizado del punto anterior):

```html
<section class="congresos-section" aria-labelledby="congresos-heading">
  <h2 id="congresos-heading">Nuestra trayectoria en los principales congresos</h2>

  <div class="congreso-modulo" data-congreso="radla">
    <div class="congreso-info">
      <h3>RADLA</h3>
      <p class="congreso-descripcion">
        Reunión Anual de Dermatólogos Latinoamericanos — uno de los congresos de dermatología
        más grandes de la región, con especialistas de 15 países.
      </p>
      <!-- TODO: año/edición y tipo de participación, pendiente de confirmación (ver sección 6) -->
    </div>

    <div class="congreso-carousel" role="region" aria-label="Fotos y videos de LUMA en RADLA">
      <!-- un .congreso-card por cada archivo encontrado en /images/radla/ -->
      <div class="congreso-card">
        <img src="/images/radla/01-foto.jpg" alt="Equipo LUMA en RADLA [año]" loading="lazy">
      </div>
      <div class="congreso-card">
        <video src="/images/radla/02-video.mp4" poster="/images/radla/02-video-poster.jpg" preload="none" controls muted playsinline></video>
      </div>
    </div>
  </div>

  <!-- repetir estructura para baas, masterhub, global-plastic-surgery-congress -->
</section>
```

---

## 5. CSS

- Cada `.congreso-modulo` con separación vertical clara entre congresos — no deben leerse como una sola masa continua de fotos.
- Usar la paleta de marca: navy para headings, gris/blanco para el fondo del módulo. Nada de esto es negociable con estilos ad-hoc — usar los tokens de diseño ya definidos en el repo.

---

## 6. JS

Mucho más simple que la sección de reels — no hay script externo que cargar:

- `loading="lazy"` nativo en las imágenes (sin necesidad de `IntersectionObserver` manual).
- Para video: `preload="none"` + `poster` para que no descargue el archivo de video hasta que el usuario le dé play. No usar autoplay.
- Si el carrusel se comparte con el de reels y ya tiene lógica JS de scroll/snap, reutilizarla — no reescribir.

---

## 7. Accesibilidad

- `alt` descriptivo real en cada imagen (ver sección 4).
- `role="region"` + `aria-label` en cada `.congreso-carousel`, específico por congreso (no un aria-label genérico repetido en los 4).
- Scroll horizontal navegable por teclado.
- Si algún video tiene audio con contenido hablado relevante, evaluar si amerita subtítulos — no es prioridad para este build si son clips ambiente sin diálogo relevante.

---

## 8. Lo que este ticket NO incluye

- Schema.org tipo `Event` para estos congresos. **No es el uso correcto de ese schema** — `Event` es para eventos futuros a los que alguien puede registrarse, no para historial de participación pasada. No inventar structured data acá; el valor de esta sección es de confianza/E-E-A-T, no de datos estructurados de evento.
- Cualquier alojamiento externo (YouTube, Vimeo) — todo el contenido vive local en `/images/`, salvo que el volumen de video termine siendo demasiado pesado para el hosting, caso en el cual se vuelve a evaluar (no asumir esto ahora).
- Copy final de cada congreso — lo de la sección 2 es material de referencia verificado, no el texto definitivo para publicar.

---

## 9. Checklist de aceptación

- [ ] Los 4 slugs de carpeta (`radla`, `baas`, `masterhub`, `global-plastic-surgery-congress`) se buscan dentro de `/images/`, sin hardcodear nombres de archivo.
- [ ] Un módulo sin carpeta o con carpeta vacía no se renderiza (ni heading, ni contenedor vacío).
- [ ] Los `alt` de las imágenes describen contenido real, no nombres de archivo.
- [ ] El video no autoplay, no descarga hasta que el usuario le da play.
- [ ] El carrusel funciona con touch, drag de mouse y teclado.
- [ ] Ningún módulo usa la palabra "único"/"la única marca" sin que esté marcado como pendiente de verificación.
- [ ] No hay markup de `Event` schema en esta sección.

---
