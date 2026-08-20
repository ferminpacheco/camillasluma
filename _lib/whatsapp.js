/* =============================================
   LUMA — Armado de links de WhatsApp
   UNA sola fuente de verdad para la URL. La usan:
     - _data/eleventyComputed.js  → `whatsappLink` (mensaje por página)
     - eleventy.config.js         → filtro `waLink` (mensaje por botón)
   ============================================= */

const site = require("../_data/site.json");

/**
 * Devuelve el link de wa.me con el mensaje ya precargado y encodeado.
 * Sin mensaje cae en el default de site.json.
 */
function linkWhatsapp(mensaje) {
  const texto = mensaje || site.whatsapp_mensaje_default;
  return `https://wa.me/${site.whatsapp_e164}?text=${encodeURIComponent(texto)}`;
}

module.exports = { linkWhatsapp };
