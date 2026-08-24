const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { linkWhatsapp } = require("./_lib/whatsapp.js");

module.exports = function (eleventyConfig) {
  /* ── Recarga de los archivos de datos JS en modo watch ──────────────
     Node cachea los módulos que se cargan con require(), y Eleventy no
     invalida esa caché entre rebuilds. Resultado: en `npm run serve` los
     cambios en .njk se ven al instante, pero los de _data/*.js y
     _lib/*.js NO — el proceso sigue usando la versión que leyó al
     arrancar, para siempre.

     Eso costó una sesión entera de debugging: al cambiar la forma de
     `link` en _data/congresos.js (de objeto a string) el servidor tomó el
     template nuevo con el dato viejo y renderizó href="[object Object]".
     El único remedio era cortar y volver a levantar el server.

     Este hook corre antes de cada rebuild del watcher y borra de la caché
     todo lo que viva en _data/ y _lib/, así se releen de disco. No afecta
     al build de producción: `eleventy.beforeWatch` solo se dispara en
     --watch / --serve. */
  const DIRS_A_RECARGAR = [
    path.join(__dirname, "_data"),
    path.join(__dirname, "_lib"),
  ];

  eleventyConfig.on("eleventy.beforeWatch", () => {
    for (const id of Object.keys(require.cache)) {
      if (DIRS_A_RECARGAR.some((dir) => id.startsWith(dir))) {
        delete require.cache[id];
      }
    }
  });

  // Passthrough: assets, imágenes y archivos estáticos de raíz
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy({ "Garantia.pdf": "assets/pdf/garantia-luma.pdf" });

  /* Fallback de favicon en la raíz. El favicon que declara el <head> sigue
     siendo el PNG (ver la nota en base.njk); este .ico existe porque
     Googlebot y varios clientes piden /favicon.ico directo a la raíz, y
     hasta ahora eso devolvía la página 404 de 11 KB. */
  eleventyConfig.addPassthroughCopy("favicon.ico");

  /* Reglas de Cache-Control para Netlify. Tiene que quedar en la raíz de la
     carpeta publicada (_site/_headers) para que Netlify lo lea. */
  eleventyConfig.addPassthroughCopy("_headers");

  // WhatsApp: link con mensaje precargado para un botón puntual.
  // El caso normal es `whatsappLink` (mensaje por página, ver
  // _data/eleventyComputed.js). Este filtro es para los botones que dentro
  // de una misma página necesitan su propio mensaje.
  eleventyConfig.addFilter("waLink", (mensaje) => linkWhatsapp(mensaje));

  /* ── Cache busting de assets ────────────────────────────────────────
     Uso:  <link rel="stylesheet" href="{{ '/assets/css/main.css' | asset }}">
     Sale: /assets/css/main.css?v=a3f9c1d2

     El sufijo es el hash del contenido del archivo. Sirve para que
     _headers pueda cachear el CSS y el JS un año como `immutable`: si el
     archivo cambia, cambia el hash, cambia la URL y el navegador se lo
     baja de nuevo. Sin esto habría que elegir entre caché larga (y que un
     cambio de estilos no le llegue nunca a quien ya visitó) o revalidar
     en cada carga.

     El query string no cambia el archivo servido: Netlify entrega el
     mismo /assets/css/main.css, la query es solo la clave de caché.

     Se cachea por (ruta + mtime) para no releer y hashear el archivo una
     vez por página en cada build. Si el archivo no existe devuelve la
     ruta tal cual en vez de romper el build. */
  const hashesAssets = new Map();

  eleventyConfig.addFilter("asset", (rutaPublica) => {
    const archivo = path.join(__dirname, rutaPublica);
    try {
      const clave = `${rutaPublica}:${fs.statSync(archivo).mtimeMs}`;
      if (!hashesAssets.has(clave)) {
        const hash = crypto
          .createHash("md5")
          .update(fs.readFileSync(archivo))
          .digest("hex")
          .slice(0, 8);
        hashesAssets.set(clave, hash);
      }
      return `${rutaPublica}?v=${hashesAssets.get(clave)}`;
    } catch {
      return rutaPublica;
    }
  });

  // Filtros de fecha para el blog
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    if (!dateObj) return "";
    return new Date(dateObj).toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    if (!dateObj) return "";
    return new Date(dateObj).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  });

  // Instagram: convierte el permalink de un reel/post en su URL embebible.
  // https://www.instagram.com/reel/CODIGO/  ->  .../reel/CODIGO/embed/
  // Descarta el query string: los parametros de tracking (utm_*, igsi) no
  // hacen falta y algunos rompen el embed.
  eleventyConfig.addFilter("igEmbed", (url) => {
    if (!url) return "";
    const limpia = String(url).split("?")[0].replace(/\/+$/, "");
    return `${limpia}/embed/`;
  });

  // Colección de posts del blog, ordenados por fecha descendente
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("blog/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
      layouts: "_includes/layouts",
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
