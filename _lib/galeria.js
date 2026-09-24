/* =============================================
   GALERÍA DE CLIENTES — lógica del filtro `galeriaFiltrar`

   Datos:  _data/galeriaClientes.json
   Markup: _includes/components/galeria-clientes.njk

   Recibe el array crudo del JSON y devuelve solo lo que se puede
   renderizar, ya enriquecido con width/height reales y el rótulo y la
   URL de la ficha del modelo. La lógica vive acá y no en Nunjucks para
   que el template quede en markup.

   Reglas:
   - Solo entran los items con `publicar: true`.
   - Los items `placeholder: true` quedan AFUERA salvo que el build corra
     con GALERIA_PLACEHOLDERS=1. Así, si esto se publica sin fotos reales,
     no aparecen renders de producto presentados como fotos de clientes
     (sería prueba social falsa): la sección directamente no se renderiza.
   - Con `modelo`: si ese modelo tiene 3 fotos o más se filtra por él; con
     menos de 3 se muestran todas, para que la banda no quede con 1 foto.
   - Un modelo desconocido o una imagen inexistente cortan el build con un
     mensaje claro: mejor eso que un link o una imagen rota en producción.
   ============================================= */

const path = require("path");
const fs = require("fs");
const { dimensiones } = require("./dimensiones.js");

const RAIZ = path.join(__dirname, "..");
const ANCHO_MAXIMO = 800;
const MINIMO_POR_MODELO = 3;

/* Única fuente de verdad del rótulo y la ficha de cada modelo. */
const MODELOS = {
  premium:      { rotulo: "LUMA Premium",      url: "/camillas-electricas/premium/" },
  one:          { rotulo: "LUMA One",          url: "/camillas-electricas/one/" },
  gold:         { rotulo: "LUMA Gold",         url: "/camillas-electricas/luma-gold/" },
  ginecologica: { rotulo: "LUMA Ginecológica", url: "/camillas-electricas/ginecologica/" },
  "luma-cart":  { rotulo: "LUMA Cart",         url: "/carritos-auxiliares/luma-cart/" },
  "luma-tech":  { rotulo: "LUMA Tech",         url: "/carritos-auxiliares/luma-tech/" },
  luminaria:    { rotulo: "Luminaria LUMA",    url: "/luminarias/" },
};

const conPlaceholders = () => process.env.GALERIA_PLACEHOLDERS === "1";

/* Se cachea por contenido del JSON: el filtro se llama una vez por página
   y no hace falta volver a leer los headers de las imágenes cada vez. */
let cache = { clave: null, items: [] };
const avisados = new Set();

function preparar(items) {
  const clave = JSON.stringify(items) + conPlaceholders();
  if (cache.clave === clave) return cache.items;

  const listos = (Array.isArray(items) ? items : [])
    .filter((item) => item && item.publicar === true)
    .filter((item) => !item.placeholder || conPlaceholders())
    .map((item) => {
      const modelo = MODELOS[item.modelo];
      if (!modelo) {
        throw new Error(
          `[galeriaClientes] Modelo "${item.modelo}" desconocido en ${item.imagen}. ` +
          `Usar uno de: ${Object.keys(MODELOS).join(", ")}.`
        );
      }

      const archivo = path.join(RAIZ, String(item.imagen || ""));
      if (!item.imagen || !fs.existsSync(archivo)) {
        throw new Error(`[galeriaClientes] No existe la imagen "${item.imagen}".`);
      }

      const dim = dimensiones(archivo);
      if (!dim) {
        throw new Error(`[galeriaClientes] No se pudieron leer las medidas de "${item.imagen}".`);
      }

      if (!item.placeholder && dim.width > ANCHO_MAXIMO && !avisados.has(item.imagen)) {
        avisados.add(item.imagen);
        console.warn(
          `[galeriaClientes] ${item.imagen} mide ${dim.width}px de ancho (máx. ${ANCHO_MAXIMO}). ` +
          `Pasala por "npm run galeria".`
        );
      }

      return {
        imagen: item.imagen,
        alt: item.alt || "",
        cita: item.cita || "",
        nombre: item.nombre || "",
        modelo: item.modelo,
        rotulo: modelo.rotulo,
        url: modelo.url,
        width: dim.width,
        height: dim.height,
      };
    });

  cache = { clave, items: listos };
  return listos;
}

function galeriaFiltrar(items, modelo) {
  const todos = preparar(items);
  if (!modelo) return todos;

  if (!MODELOS[modelo]) {
    throw new Error(`[galeriaClientes] galeriaModelo "${modelo}" desconocido.`);
  }

  const delModelo = todos.filter((item) => item.modelo === modelo);
  return delModelo.length >= MINIMO_POR_MODELO ? delModelo : todos;
}

module.exports = { galeriaFiltrar, MODELOS };
