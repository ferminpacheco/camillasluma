module.exports = function (eleventyConfig) {
  // Passthrough: assets, imágenes y archivos estáticos de raíz
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy({ "Garantia.pdf": "assets/pdf/garantia-luma.pdf" });

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
