/* =============================================
   GALERÍA DE CLIENTES — optimizador de fotos

   Uso:   npm run galeria

   Toma cada foto de _originales/galeria-clientes/ (carpeta que NO se
   publica) y escribe una versión WebP de máximo 800px de ancho en
   /images/galeria-clientes/, con el mismo nombre y extensión .webp.
   No se corre en cada build: se corre al sumar fotos y se commitea el
   resultado, igual que `npm run og`.

   - No agranda fotos chicas (withoutEnlargement).
   - Respeta la orientación EXIF del celular (rotate()).
   - Saltea las que ya existen y son más nuevas que el original.
   - .HEIC no: convertir antes a JPG desde el teléfono o la Mac.
   ============================================= */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const ORIGEN = path.join(RAIZ, "_originales", "galeria-clientes");
const DESTINO = path.join(RAIZ, "images", "galeria-clientes");
const ANCHO_MAXIMO = 800;
const EXTENSIONES = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"];

async function main() {
  if (!fs.existsSync(ORIGEN)) {
    fs.mkdirSync(ORIGEN, { recursive: true });
    console.log(`Creé ${path.relative(RAIZ, ORIGEN)}/. Soltá ahí las fotos originales y volvé a correr.`);
    return;
  }
  fs.mkdirSync(DESTINO, { recursive: true });

  const archivos = fs.readdirSync(ORIGEN)
    .filter((f) => EXTENSIONES.includes(path.extname(f).toLowerCase()));

  if (!archivos.length) {
    console.log(`No hay fotos en ${path.relative(RAIZ, ORIGEN)}/.`);
    return;
  }

  for (const archivo of archivos) {
    const origen = path.join(ORIGEN, archivo);
    const nombre = path.basename(archivo, path.extname(archivo))
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const destino = path.join(DESTINO, `${nombre}.webp`);

    if (fs.existsSync(destino) && fs.statSync(destino).mtimeMs > fs.statSync(origen).mtimeMs) {
      console.log(`=  ${path.relative(RAIZ, destino)} (ya estaba)`);
      continue;
    }

    const info = await sharp(origen)
      .rotate()
      .resize({ width: ANCHO_MAXIMO, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(destino);

    console.log(`✓  /${path.relative(RAIZ, destino)}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
  }

  console.log('\nAhora sumá cada foto a _data/galeriaClientes.json con "imagen": "/images/galeria-clientes/<nombre>.webp".');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
