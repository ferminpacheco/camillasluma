/* =============================================
   OG CARDS — genera las imágenes de compartir (Open Graph / Twitter).

   Uso:   npm run og

   Escribe /images/og/*.jpg. NO se corre en cada build: las tarjetas se
   versionan como cualquier otra imagen. Correlo solo cuando cambia una
   foto de origen o se suma una página, y commiteá el resultado.

   ── POR QUÉ JPEG Y NO WEBP ──────────────────────────────────────────
   Excepción deliberada a la convención de "todo WebP" del proyecto, de
   la misma clase que el favicon PNG (ver la nota en base.njk).

   El canal de venta de LUMA es WhatsApp. El crawler que arma la preview
   de un link en WhatsApp es poco confiable con WebP: en varios clientes
   la tarjeta sale sin imagen. Facebook y LinkedIn sí lo soportan, pero
   no vale la pena arriesgar justo el canal que más importa por ahorrar
   unos KB en una imagen que el visitante nunca descarga navegando.
   NO convertir esta carpeta a WebP.

   ── LOS DOS TRATAMIENTOS ────────────────────────────────────────────
   1. "foto"   — recorte a sangre de una foto apaisada.
      Se usa cuando la carpeta tiene una imagen 16:9 (ar ~1.79): recortarla
      a 1200x630 (ar 1.905) cuesta 6% del alto, o sea nada. Es el caso de
      los 7 productos y los 2 hubs.
      ⚠️ NO alimentar este tratamiento con una imagen cuadrada: recortar
      1024x1024 a 1200x630 se come el 48% del alto y parte el producto al
      medio. Si mañana falta la apaisada, usar "lienzo", no la cuadrada.

   2. "lienzo" — foto sangrada a la derecha sobre fondo de marca + logo.
      Rescata las fuentes que no se pueden recortar (verticales) y las
      páginas que no tienen foto de producto. Es el caso de /nosotros/
      (las fotos de RADLA son todas verticales) y /garantia/.
   ============================================= */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const SALIDA = path.join(RAIZ, "images", "og");

const W = 1200;
const H = 630;

/* --fondo del design system (tokens.css). Si se confirma {{HEX_OFICIALES}}
   y cambia, actualizar acá también: esto no lee el CSS. */
const FONDO = { r: 237, g: 232, b: 228, alpha: 1 };

/* Calidad alta a propósito: la imagen se ve una sola vez, grande, en la
   preview de un chat. No es un asset de navegación, no compite por LCP. */
const JPEG = { quality: 86, chromaSubsampling: "4:4:4", mozjpeg: true };

/* ── Mapa de páginas ──────────────────────────────────────────────────
   `src` es siempre la imagen MÁS APAISADA de la carpeta del producto.
   El número entre paréntesis es la relación de aspecto del origen. */
const PAGINAS = [
  {
    /* La home comparte fuente con el hub de camillas a propósito: las dos
       comunican la línea completa, no un modelo. Antes usaba la foto de la
       Premium y quedaba idéntica a /camillas-electricas/premium/, que es
       la URL que sí tiene que apropiarse de esa imagen. */
    salida: "home.jpg",
    tratamiento: "foto",
    src: "images/banner-camillas-electricas.webp", // 2.36
    alt: "Línea de camillas eléctricas LUMA en un consultorio de estética.",
  },
  {
    salida: "camillas-electricas.jpg",
    tratamiento: "foto",
    src: "images/banner-camillas-electricas.webp", // 2.36
    alt: "Línea de camillas eléctricas LUMA.",
  },
  {
    salida: "premium.jpg",
    tratamiento: "foto",
    src: "images/luma-premium/luma-premium-blanca-7.webp", // 1.77
    alt: "Camilla eléctrica LUMA Premium de 3 motores, blanca, en un consultorio.",
  },
  {
    salida: "luma-gold.jpg",
    tratamiento: "foto",
    src: "images/luma-gold/luma-gold-consultorio.webp", // 1.79
    alt: "Set LUMA Gold en un consultorio: camilla eléctrica de base dorada, silla profesional y carrito LUMA Cart Gold.",
  },
  {
    salida: "one.jpg",
    tratamiento: "foto",
    src: "images/luma-one/luma-one-9.webp", // 2.33
    alt: "Camilla eléctrica LUMA One de 3 motores en un consultorio de estética.",
  },
  {
    salida: "ginecologica.jpg",
    tratamiento: "foto",
    src: "images/luma-ginecologica/luma-ginecologica-11.webp", // 1.79
    alt: "Camilla ginecológica eléctrica LUMA con pierneras ajustables.",
  },
  {
    salida: "carritos-auxiliares.jpg",
    tratamiento: "foto",
    src: "images/banner-carritos-1.webp", // 2.33
    alt: "Carritos auxiliares LUMA para cabinas de estética.",
  },
  {
    salida: "luma-cart.jpg",
    tratamiento: "foto",
    src: "images/luma-cart/luma-cart-6.webp", // 1.79
    alt: "LUMA Cart, carrito auxiliar blanco de diseño curvo para estética.",
  },
  {
    salida: "luma-tech.jpg",
    tratamiento: "foto",
    src: "images/luma-tech/luma-tech-8.webp", // 1.79
    alt: "LUMA Tech, carrito reforzado para aparatología estética.",
  },
  {
    salida: "luminarias.jpg",
    tratamiento: "foto",
    src: "images/luma-luminarias/hf_20260814_234902_10a5b3ee-af42-4349-a93c-af481c88e31a.webp", // 1.79 — plano cerrado del arco LED
    alt: "Luminaria LED LUMA para consultorio de estética.",
  },
  {
    /* Las fotos de stand son verticales (ar 0.55-0.75). Recortarlas se
       comería el 61% del alto, así que van en lienzo.
       La foto vive en /images/the-global-plastic-surgery/ desde el
       25-08-2026 (se movió de /images/radla/), pero sigue siendo la del
       stand de RADLA: por eso el alt la nombra. */
    salida: "nosotros.jpg",
    tratamiento: "lienzo",
    src: "images/the-global-plastic-surgery/00-stand-camilla-premium-mostrador-atencion.webp",
    alt: "Stand de LUMA en el congreso RADLA con una camilla eléctrica Premium.",
  },
  {
    /* No hay foto de producto que represente la garantía sin ser
       arbitraria: tarjeta de marca, solo el logo. */
    salida: "garantia.jpg",
    tratamiento: "marca",
    alt: "LUMA — Camillas eléctricas y equipamiento médico estético.",
  },
  {
    /* Fallback: lo usa cualquier página que no declare `ogImage`.
       Es la red de seguridad para que no vuelva a pasar lo de H-02. */
    salida: "default.jpg",
    tratamiento: "marca",
    alt: "LUMA — Camillas eléctricas y equipamiento médico estético.",
  },
];

/* ── Tratamientos ─────────────────────────────────────────────────── */

/* Recorte a sangre, centrado. `cover` recorta el excedente por el lado
   largo; con un origen 16:9 eso son unos pocos píxeles arriba y abajo. */
async function foto(src) {
  return sharp(path.join(RAIZ, src))
    .resize({ width: W, height: H, fit: "cover", position: "centre" })
    .png()
    .toBuffer();
}

/* Foto sangrada a la derecha, fundida con el lienzo por un degradado, y
   el logo a la izquierda. El degradado evita el borde duro que delata el
   recorte pegado; como las fotos de producto tienen fondo claro, la
   costura no se ve. */
async function lienzo(src) {
  /* Ancho fijo del panel. Sin esto, una fuente muy vertical (RADLA es
     852x1551) escalada solo por alto da un panel de 346px — el 29% de la
     tarjeta — y la foto queda como una tirita al costado del logo. */
  const PANEL = 620;

  const img = await sharp(path.join(RAIZ, src))
    .resize({ width: PANEL, height: H, fit: "cover", position: "centre" })
    .toBuffer();
  const im = await sharp(img).metadata();

  const degradado = Buffer.from(
    `<svg width="${im.width}" height="${H}">
       <defs><linearGradient id="g" x1="0" x2="1">
         <stop offset="0" stop-color="rgb(237,232,228)" stop-opacity="1"/>
         <stop offset="0.3" stop-color="rgb(237,232,228)" stop-opacity="0"/>
       </linearGradient></defs>
       <rect width="${im.width}" height="${H}" fill="url(#g)"/>
     </svg>`
  );
  const fundida = await sharp(img).composite([{ input: degradado }]).toBuffer();

  const logo = await sharp(path.join(RAIZ, "images/logo_luma_2.webp"))
    .resize({ width: 330, fit: "inside" })
    .toBuffer();
  const lm = await sharp(logo).metadata();

  return sharp({ create: { width: W, height: H, channels: 4, background: FONDO } })
    .composite([
      { input: fundida, left: W - im.width, top: 0 },
      { input: logo, left: 78, top: Math.round((H - lm.height) / 2) },
    ])
    .png()
    .toBuffer();
}

/* Solo el logo, centrado sobre el fondo de marca. */
async function marca() {
  const logo = await sharp(path.join(RAIZ, "images/logo_luma_2.webp"))
    .resize({ width: 460, fit: "inside" })
    .toBuffer();
  const lm = await sharp(logo).metadata();

  return sharp({ create: { width: W, height: H, channels: 4, background: FONDO } })
    .composite([
      { input: logo, left: Math.round((W - lm.width) / 2), top: Math.round((H - lm.height) / 2) },
    ])
    .png()
    .toBuffer();
}

/* ── Generación ───────────────────────────────────────────────────── */

const TRATAMIENTOS = { foto, lienzo, marca };

module.exports = async function generar() {
  fs.mkdirSync(SALIDA, { recursive: true });

  const hechas = [];
  for (const p of PAGINAS) {
    if (p.src && !fs.existsSync(path.join(RAIZ, p.src))) {
      throw new Error(`Falta la imagen de origen de ${p.salida}: ${p.src}`);
    }

    const buf = await TRATAMIENTOS[p.tratamiento](p.src);
    const destino = path.join(SALIDA, p.salida);
    await sharp(buf).jpeg(JPEG).toFile(destino);

    hechas.push({
      archivo: p.salida,
      tratamiento: p.tratamiento,
      kb: Math.round(fs.statSync(destino).size / 1024),
    });
  }
  return hechas;
};

/* Ejecutable directo: node _lib/og-cards.js */
if (require.main === module) {
  module.exports()
    .then((hechas) => {
      for (const h of hechas) {
        console.log(h.archivo.padEnd(26) + h.tratamiento.padEnd(9) + h.kb + " KB");
      }
      console.log(`\n${hechas.length} tarjetas en /images/og/`);
    })
    .catch((e) => {
      console.error("ERROR:", e.message);
      process.exit(1);
    });
}
