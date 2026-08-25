/* =============================================
   CONGRESOS — datos de la sección de trayectoria (/nosotros/)

   Enumera el filesystem en cada build. NO hay lista de archivos
   hardcodeada: el contenido de cada módulo es, literalmente, lo que
   haya dentro de /images/<slug>/ en el momento de compilar.

   Para agregar o sacar fotos: soltar / borrar archivos en esa carpeta.
   No hay que tocar este archivo ni el template.

   CONVENCIONES para el equipo que carga las fotos
   -----------------------------------------------
   1. Prefijo numérico para controlar el orden: 01-, 02-, 03-...
      Sin prefijo, el orden es alfabético.
   2. Nombre de archivo descriptivo en kebab-case. Se usa como fallback
      del alt si no hay una entrada en `alts` (ver abajo).
   3. Formatos aceptados: .webp .jpg .jpeg .png .avif (imagen)
      y .mp4 .webm (video).
      ⚠️ NO subir .HEIC: solo lo muestra Safari, en Chrome / Firefox /
      Edge queda una imagen rota. Convertir a WebP antes de subir.
   4. Un video sin su archivo poster al lado (mismo nombre + "-poster")
      no se renderiza: sin poster la tarjeta queda como un rectángulo
      negro hasta que alguien le da play.

   Si una carpeta no existe o no tiene archivos válidos, ese congreso
   directamente no entra en el array y el módulo no se renderiza
   (ni heading ni contenedor vacío).
   ============================================= */

const fs = require("fs");
const path = require("path");

const DIR_IMAGENES = path.join(__dirname, "..", "images");

const EXT_IMAGEN = [".webp", ".jpg", ".jpeg", ".png", ".avif"];
const EXT_VIDEO = [".mp4", ".webm"];

/* Copy verificado contra fuentes públicas (sitios oficiales de cada
   congreso / comunicado de ASPS). Ver docs/luma-seccion-congresos.md §2.

   ⚠️ NO agregar superlativos. En particular, NO escribir que LUMA es
   "la única" marca presente: no se verificó si la competencia también
   expone. Tampoco afirmar categoría de participación más allá de lo que
   se ve en las fotos.

   `carpetas`: se prueban en orden. El spec nombra el slug de la cuarta
   carpeta de tres formas distintas (§3 vs §9) y en disco está con una
   cuarta, así que se aceptan todas en vez de romperse por un renombre.

   `link` (opcional): URL al sitio oficial del congreso. La card solo lo
   renderiza si está — hoy lo tienen RADLA y Masterhub, los otros dos no.
   El rótulo visible ("Ver más") es fijo y vive en bloque-congresos.njk:
   es el mismo para todas las cards, así que no se repite acá. */
const CONGRESOS = [
  {
    slug: "radla",
    carpetas: ["radla"],
    nombre: "RADLA",
    nombreCompleto: "Reunión Anual de Dermatólogos Latinoamericanos",
    especialidad: "Dermatología",
    descripcion:
      "Uno de los congresos de dermatología más grandes de la región, con especialistas de 15 países latinoamericanos.",
    altBase: "LUMA en RADLA",
    link: "https://radla2026.org/exposicion#patrocinadores",
  },
  {
    slug: "baas",
    carpetas: ["baas"],
    nombre: "BAAS International Congress",
    nombreCompleto: "BAAS International Congress",
    especialidad: "Medicina estética",
    descripcion:
      "El congreso de medicina estética en español más grande de América: más de 300 disertantes y 7 auditorios simultáneos.",
    altBase: "LUMA en el BAAS International Congress",
  },
  {
    slug: "masterhub",
    carpetas: ["masterhub"],
    nombre: "Masterhub",
    nombreCompleto: "Masterhub",
    especialidad: "Medicina estética facial",
    descripcion:
      "Congreso de referencia en rejuvenecimiento facial no quirúrgico de Latinoamérica, dirigido por el Dr. Fernando Felice. Es el único evento de la región con disección cadavérica en vivo.",
    altBase: "LUMA en Masterhub",
    link: "https://masterhublatam.com/#speakers",
  },
  {
    slug: "global-plastic-surgery-congress",
    carpetas: [
      "the-global-plastic-surgery-congress",
      "global-plastic-surgery-congress",
      "the-global-plastic-surgery",
    ],
    nombre: "The Global Plastic Surgery Congress",
    nombreCompleto: "The Global Plastic Surgery Congress",
    especialidad: "Cirugía plástica",
    descripcion:
      "Organizado por la ASPS (American Society of Plastic Surgeons) en alianza con SACPER. Fue el primer congreso que la ASPS realizó fuera de Estados Unidos.",
    altBase: "LUMA en The Global Plastic Surgery Congress",
  },
];

/* Alt reales, escritos mirando cada foto. Clave: nombre de archivo.
   Un archivo que no esté acá no queda sin alt: cae al fallback derivado
   del nombre de archivo (ver `altDeArchivo`). */
const ALTS = {
  "radla/01-stand-camilla-premium-vista-general.webp":
    "Stand de LUMA en RADLA con una camilla eléctrica Premium blanca iluminada, lámpara LED de aro y pantalla con material de marca.",
  "radla/02-cabecera-camilla-premium.webp":
    "Cabecera y apoyacabeza de la camilla eléctrica Premium de LUMA sobre el frente del stand en RADLA.",
  "radla/03-grafica-stand-luma.webp":
    "Gráfica del stand de LUMA en RADLA con el logo y la leyenda «Diseño y tecnología para tu espacio».",
  "radla/04-camilla-premium-pantalla-ginecologica.webp":
    "Camilla eléctrica Premium de LUMA en RADLA junto a la pantalla que muestra el modelo ginecológico en uso.",
  "radla/05-stand-mostrador-pantalla.webp":
    "Vista del stand de LUMA en RADLA: camilla eléctrica, mostrador de atención y pantalla con videos de producto.",
  "radla/06-stand-pantalla-control-camilla.webp":
    "Stand de LUMA en RADLA con la pantalla mostrando el control remoto de la camilla eléctrica.",
  "radla/07-stand-vista-pasillo.webp":
    "Stand de LUMA en RADLA visto desde el pasillo de expositores del congreso.",
  "radla/08-stand-lampara-pie-led.webp":
    "Camilla eléctrica Premium de LUMA junto a una lámpara de pie LED en el stand de RADLA.",
  "radla/09-camilla-premium-reclinada.webp":
    "Camilla eléctrica Premium de LUMA reclinada en posición de trabajo, en el stand de RADLA.",
  "radla/00-equipo-luma-atendiendo-mostrador.webp":
    "Integrante del equipo de LUMA atendiendo en el mostrador del stand de RADLA.",
  "radla/11-equipo-luma-mostrador-pantalla.webp":
    "Integrante del equipo de LUMA en el mostrador del stand de RADLA, con la camilla Premium en primer plano.",
  "radla/12-stand-completo-carro-auxiliar.webp":
    "Stand completo de LUMA en RADLA con la camilla eléctrica Premium y un carro auxiliar.",
  "radla/13-stand-completo-frente.webp":
    "Frente completo del stand de LUMA en RADLA con la camilla eléctrica Premium iluminada.",

  "baas/01-stand-visitantes-pantalla.webp":
    "Stand de LUMA en el BAAS International Congress con visitantes consultando frente a la pantalla de producto.",
  "baas/02-stand-demo-control-camilla.webp":
    "Demostración del control de la camilla eléctrica LUMA a visitantes del BAAS International Congress.",
  "baas/03-stand-camilla-premium-carros.webp":
    "Stand de LUMA en el BAAS International Congress con una camilla eléctrica Premium y los carros auxiliares.",
  "baas/04-stand-profesionales-consultando.webp":
    "Profesionales de la estética consultando en el stand de LUMA durante el BAAS International Congress.",

  "masterhub/01-stand-camillas-high-y-premium.webp":
    "Espacio de LUMA en Masterhub con dos camillas eléctricas iluminadas y los banners de los modelos High y Premium.",
  "masterhub/02-equipo-luma-stand.webp":
    "Equipo de LUMA en su espacio de Masterhub, entre las dos camillas eléctricas exhibidas.",
  "masterhub/03-equipo-luma-entre-camillas.webp":
    "Equipo de LUMA junto a las camillas eléctricas y los banners de marca en Masterhub.",

  /* ⚠️ Ninguna foto de esta carpeta es del congreso. La 00- es del stand de
     LUMA en RADLA y se movió acá el 25-08-2026 a pedido del cliente, para que
     la card muestre un stand y no un consultorio; las otras dos son
     consultorios de clientes. Los alt describen lo que se ve y a propósito no
     mencionan el congreso — no hay foto que respalde una afirmación de
     participación. Reemplazar cuando lleguen fotos reales del stand. */
  "the-global-plastic-surgery/00-stand-camilla-premium-mostrador-atencion.webp":
    "Stand de LUMA en un congreso médico: camilla eléctrica Premium blanca con iluminación LED en la base, carro auxiliar, pantalla de marca y personal atendiendo en el mostrador.",
  "the-global-plastic-surgery/01-consultorio-camilla-premium-lampara-led.webp":
    "Consultorio con una camilla eléctrica LUMA blanca, lámpara LED de aro y carro auxiliar.",
  "the-global-plastic-surgery/02-consultorio-camilla-instalada.webp":
    "Camilla eléctrica LUMA recién instalada en un consultorio, con la iluminación de base encendida.",
};

/* ── Utilidades ───────────────────────────── */

const esImagen = (f) => EXT_IMAGEN.includes(path.extname(f).toLowerCase());
const esVideo = (f) => EXT_VIDEO.includes(path.extname(f).toLowerCase());

/* Orden: el prefijo numérico manda; si no lo hay, alfabético.
   `localeCompare` con numeric evita que 10 se ordene antes que 2. */
function ordenar(a, b) {
  return a.localeCompare(b, "es", { numeric: true, sensitivity: "base" });
}

/* Fallback de alt para un archivo que no está en ALTS: se arma con el
   nombre de archivo (sacándole el prefijo numérico y la extensión) más
   el contexto del congreso. Sirve para que una foto nueva entre con un
   alt razonable el día que la suban, sin tocar código. */
function altDeArchivo(archivo, congreso) {
  const base = path
    .basename(archivo, path.extname(archivo))
    .replace(/^\d+[-_]/, "")
    .replace(/[-_]+/g, " ")
    .trim();

  if (!base) return congreso.altBase;

  const descripcion = base.charAt(0).toUpperCase() + base.slice(1);
  return `${descripcion} — ${congreso.altBase}.`;
}

/* Dimensiones reales del archivo, para poder emitir width/height y que
   el carrusel no salte mientras cargan las fotos (CLS).
   Se leen los primeros bytes del archivo: alcanza para WebP, PNG y JPEG
   y evita sumar una dependencia de imágenes al build. */
function dimensiones(rutaAbsoluta) {
  let fd;
  try {
    fd = fs.openSync(rutaAbsoluta, "r");
    const buf = Buffer.alloc(64 * 1024);
    const leidos = fs.readSync(fd, buf, 0, buf.length, 0);
    const b = buf.subarray(0, leidos);

    // PNG: IHDR arranca en el byte 16.
    if (b.length > 24 && b.toString("ascii", 1, 4) === "PNG") {
      return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    }

    // WebP: RIFF....WEBP + un chunk VP8 / VP8L / VP8X.
    if (b.length > 30 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
      const tipo = b.toString("ascii", 12, 16);

      if (tipo === "VP8 ") {
        // Frame header: los 14 bits bajos de cada uno son el tamaño.
        return {
          width: b.readUInt16LE(26) & 0x3fff,
          height: b.readUInt16LE(28) & 0x3fff,
        };
      }
      if (tipo === "VP8L") {
        // 14 bits para el ancho y 14 para el alto, empaquetados, base 0.
        const bits = b.readUInt32LE(21);
        return {
          width: (bits & 0x3fff) + 1,
          height: ((bits >> 14) & 0x3fff) + 1,
        };
      }
      if (tipo === "VP8X") {
        // Canvas size: dos enteros de 24 bits little-endian, base 0.
        return {
          width: (b[24] | (b[25] << 8) | (b[26] << 16)) + 1,
          height: (b[27] | (b[28] << 8) | (b[29] << 16)) + 1,
        };
      }
    }

    // JPEG: recorrer los markers hasta un SOFn, que trae alto y ancho.
    if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length - 9) {
        if (b[i] !== 0xff) { i++; continue; }
        const marker = b[i + 1];
        // SOF0-SOF15, salteando los que no son de frame (C4, C8, CC).
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
        }
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
  } catch (e) {
    // Un archivo ilegible no debe romper el build entero.
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }

  return null;
}

/* Poster de un video: mismo nombre + "-poster" con cualquier extensión
   de imagen. Sin poster no se renderiza el video (queda un rectángulo
   negro y además el navegador no tiene qué mostrar antes del play). */
function buscarPoster(archivoVideo, archivosDeLaCarpeta) {
  const base = path.basename(archivoVideo, path.extname(archivoVideo));
  return archivosDeLaCarpeta.find(
    (f) => esImagen(f) && path.basename(f, path.extname(f)) === `${base}-poster`
  );
}

/* ── Armado ───────────────────────────────── */

module.exports = function () {
  return CONGRESOS.map((congreso) => {
    // Primera carpeta que exista de los alias declarados.
    const carpeta = congreso.carpetas.find((c) =>
      fs.existsSync(path.join(DIR_IMAGENES, c))
    );
    if (!carpeta) return null;

    const rutaCarpeta = path.join(DIR_IMAGENES, carpeta);
    const archivos = fs.readdirSync(rutaCarpeta).sort(ordenar);

    // Los posters son de los videos: no son piezas del carrusel.
    const posters = new Set(
      archivos.filter(esVideo).map((v) => buscarPoster(v, archivos)).filter(Boolean)
    );

    const piezas = [];

    for (const archivo of archivos) {
      const url = `/images/${carpeta}/${archivo}`;
      const alt = ALTS[`${carpeta}/${archivo}`] || altDeArchivo(archivo, congreso);

      if (esImagen(archivo) && !posters.has(archivo)) {
        piezas.push({ tipo: "imagen", url, alt, ...(dimensiones(path.join(rutaCarpeta, archivo)) || {}) });
        continue;
      }

      if (esVideo(archivo)) {
        const poster = buscarPoster(archivo, archivos);
        // Sin poster no se muestra: ver nota en el encabezado.
        if (!poster) continue;
        piezas.push({
          tipo: "video",
          url,
          alt,
          poster: `/images/${carpeta}/${poster}`,
          ...(dimensiones(path.join(rutaCarpeta, poster)) || {}),
        });
      }
    }

    // Carpeta vacía o sin archivos utilizables: el módulo no se renderiza.
    if (!piezas.length) return null;

    /* Portada de la card: la primera imagen de la carpeta (por eso importa
       el prefijo numérico). Si la carpeta arranca con un video, se usa su
       poster: el <img> de la card nunca puede apuntar a un .mp4.

       `piezas` sigue publicándose completo aunque hoy la card muestre una
       sola foto: el resto del material queda disponible sin volver a tocar
       este archivo el día que se agregue una galería. */
    const primeraImagen = piezas.find((p) => p.tipo === "imagen");
    const portada = primeraImagen || { ...piezas[0], url: piezas[0].poster };

    return { ...congreso, carpeta, piezas, portada };
  }).filter(Boolean);
};
