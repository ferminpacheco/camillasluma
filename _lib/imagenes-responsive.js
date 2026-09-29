/* =============================================
   IMÁGENES RESPONSIVE — versiones chicas para celular

   Uso:   npm run responsive

   Genera, al lado de cada original, versiones WebP más chicas:
     - Fotos del hero de las fichas (<section class="producto-hero">):
       <nombre>-480.webp y <nombre>-640.webp. El <img> las usa con srcset,
       así un celular baja ~40 KB en vez de la foto de 1024 px.
     - Fondos de hero de los hubs: <nombre>-800.webp (media query en CSS).

   NO se corre en cada build: se corre al cambiar una foto de hero y se
   commitea el resultado, igual que `npm run og`. Saltea lo que ya existe
   y es más nuevo que el original.
   ============================================= */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const FICHAS = [
  "camillas-electricas/premium/index.njk",
  "camillas-electricas/one/index.njk",
  "camillas-electricas/luma-gold/index.njk",
  "camillas-electricas/ginecologica/index.njk",
  "carritos-auxiliares/luma-cart/index.njk",
  "carritos-auxiliares/luma-tech/index.njk",
  "luminarias/index.njk",
];
const ANCHOS_HERO = [480, 640];
const FONDOS_HUB = [
  ["images/banner-camillas-electricas.webp", 800],
  ["images/banner-carritos-1.webp", 800],
];

async function generar(origen, ancho) {
  const destino = origen.replace(/\.webp$/, `-${ancho}.webp`);
  const absO = path.join(RAIZ, origen);
  const absD = path.join(RAIZ, destino);
  if (fs.existsSync(absD) && fs.statSync(absD).mtimeMs > fs.statSync(absO).mtimeMs) return;
  const info = await sharp(absO)
    .resize({ width: ancho, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(absD);
  console.log(`✓  /${destino}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
}

async function main() {
  const fotos = new Set();
  for (const ficha of FICHAS) {
    const html = fs.readFileSync(path.join(RAIZ, ficha), "utf8");
    const hero = html.match(/<section class="producto-hero">[\s\S]*?<\/section>/);
    if (!hero) continue;
    for (const m of hero[0].matchAll(/src="\/(images\/[^"]+\.webp)"/g)) fotos.add(m[1]);
  }
  for (const foto of fotos) for (const ancho of ANCHOS_HERO) await generar(foto, ancho);
  for (const [fondo, ancho] of FONDOS_HUB) await generar(fondo, ancho);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
