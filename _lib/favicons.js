/* =============================================
   FAVICONS — genera los iconos del sitio y el site.webmanifest.

   Uso:   npm run favicons

   Escribe en la raíz del repo (y Eleventy los copia a la raíz de _site):
     favicon.ico (16/32/48), favicon-48x48.png, favicon-96x96.png,
     favicon-192x192.png, favicon-512x512.png, apple-touch-icon.png (180)
     y site.webmanifest.
   Además pisa /images/logo_luma_favicon.png (96px), la URL vieja del
   favicon, para que quien la tenga cacheada reciba el diseño nuevo.

   NO se corre en cada build: los archivos se versionan. Correlo solo si
   cambia el diseño, y commiteá el resultado.

   ── DISEÑO (provisorio, oct-2026) ───────────────────────────────────
   Solo la palabra "LUMA" del logo (sin la onda ni "PREMIUM"), recortada
   al ras, en blanco sobre navy sólido. Se reemplaza por el isotipo de la
   onda cuando llegue el vectorial del cliente: cambiar FUENTE / RECORTE
   y volver a correr. Mantener los nombres de archivo: Google cachea las
   URLs y cambiarlas reinicia la detección del favicon.

   - Fondo OPACO siempre. Nunca transparente, nunca rosa ni sus variantes
     (regla del cliente). El script verifica cada archivo al final y
     corta con error si encuentra un pixel rosado o transparente.
   - "LUMA" ocupa el 70% del ancho y va centrado: Google muestra el
     favicon recortado en círculo y así no se cortan la L ni la A.
   ============================================= */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");

/* Navy primario de docs/luma-guia-de-marca.md (sección paleta). Es el
   mismo --navy de tokens.css. Si se confirma {{HEX_OFICIALES}} y cambia,
   actualizar acá también. */
const NAVY_HEX = "#0A2956";
const NAVY = { r: 10, g: 41, b: 86 };

/* Logo master con alfa. En este archivo la onda ocupa las filas 366–465 y
   "LUMA" las 518–657; el recorte deja solo la palabra (sharp.trim() la
   ajusta al ras). */
const FUENTE = path.join(RAIZ, "_originales", "pre-webp", "logo_luma_2.png");
const RECORTE = { left: 190, top: 500, width: 644, height: 170 };

const ANCHO_TEXTO = 0.7;

const PNGS = [
  { archivo: "favicon-48x48.png", lado: 48 },
  { archivo: "favicon-96x96.png", lado: 96 },
  { archivo: "favicon-192x192.png", lado: 192 },
  { archivo: "favicon-512x512.png", lado: 512 },
  { archivo: "apple-touch-icon.png", lado: 180 },
  { archivo: "images/logo_luma_favicon.png", lado: 96 },
];
const ICO_LADOS = [16, 32, 48];

/* Máscara de "LUMA": el canal alfa del logo, al ras. Las letras salen en
   blanco usando esa máscara, así se conserva el antialias del original. */
async function mascaraPalabra() {
  const { data, info } = await sharp(FUENTE)
    .extract(RECORTE)
    .extractChannel("alpha")
    .raw()
    .toBuffer({ resolveWithObject: true });
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 1 } })
    .trim({ background: "#000000", threshold: 10 })
    .png()
    .toBuffer();
}

async function icono(mascara, lado) {
  const anchoTexto = Math.round(lado * ANCHO_TEXTO);
  const alfa = await sharp(mascara)
    .resize({ width: anchoTexto, kernel: "lanczos3" })
    .toColourspace("b-w")
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = alfa.info;

  const letras = await sharp({
    create: { width, height, channels: 3, background: "#ffffff" },
  })
    .joinChannel(alfa.data, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();

  return sharp({
    create: { width: lado, height: lado, channels: 3, background: NAVY },
  })
    .composite([
      {
        input: letras,
        left: Math.round((lado - width) / 2),
        top: Math.round((lado - height) / 2),
      },
    ])
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/* ICO con PNG embebido (formato válido desde Windows Vista, lo leen todos
   los navegadores y Google). sharp no escribe ICO, se arma a mano. */
function armarIco(pngs) {
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0);
  cabecera.writeUInt16LE(1, 2);
  cabecera.writeUInt16LE(pngs.length, 4);
  const entradas = [];
  let offset = 6 + 16 * pngs.length;
  for (const { lado, buffer } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(lado >= 256 ? 0 : lado, 0);
    e.writeUInt8(lado >= 256 ? 0 : lado, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buffer.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buffer.length;
    entradas.push(e);
  }
  return Buffer.concat([cabecera, ...entradas, ...pngs.map((p) => p.buffer)]);
}

/* Rosa / fucsia / magenta / salmón: tono entre 290° y 360° o entre 0° y
   20° con saturación visible, y rojo por encima del azul. El navy (215°)
   y los grises del antialias (saturación ~0) no entran. */
function esRosado(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  if (sat < 0.15 || max < 60) return false;
  let h;
  if (max === r) h = (60 * ((g - b) / (max - min)) + 360) % 360;
  else if (max === g) h = 60 * ((b - r) / (max - min)) + 120;
  else h = 60 * ((r - g) / (max - min)) + 240;
  return (h >= 290 || h <= 20) && r > b;
}

async function verificar(buffer, nombre) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let rosados = 0;
  let transparentes = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (esRosado(data[i], data[i + 1], data[i + 2])) rosados++;
    if (data[i + 3] < 255) transparentes++;
  }
  if (rosados || transparentes) {
    throw new Error(`${nombre}: ${rosados} px rosados y ${transparentes} px transparentes`);
  }
  console.log(`  ok  ${nombre} (${info.width}x${info.height}, sin rosa, opaco)`);
}

async function main() {
  const mascara = await mascaraPalabra();

  for (const { archivo, lado } of PNGS) {
    const buffer = await icono(mascara, lado);
    await verificar(buffer, archivo);
    fs.writeFileSync(path.join(RAIZ, archivo), buffer);
  }

  const icoPngs = [];
  for (const lado of ICO_LADOS) {
    const buffer = await icono(mascara, lado);
    await verificar(buffer, `favicon.ico [${lado}]`);
    icoPngs.push({ lado, buffer });
  }
  fs.writeFileSync(path.join(RAIZ, "favicon.ico"), armarIco(icoPngs));

  const manifest = {
    name: "LUMA — Camillas eléctricas",
    short_name: "LUMA",
    icons: [
      { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    theme_color: NAVY_HEX,
    background_color: NAVY_HEX,
    display: "browser",
    start_url: "/",
  };
  fs.writeFileSync(path.join(RAIZ, "site.webmanifest"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`  ok  site.webmanifest (theme/background ${NAVY_HEX})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
