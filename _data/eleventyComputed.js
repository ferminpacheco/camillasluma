/* =============================================
   LUMA — Datos computados por página
   ============================================= */

const { linkWhatsapp } = require("../_lib/whatsapp.js");
const { construirMigas } = require("../_lib/migas.js");

module.exports = {
  /*
    Link de WhatsApp con mensaje contextual a la página desde la que se
    hace click. Reemplaza al viejo `site.whatsapp_link`, que era un único
    link estático con el mismo texto en las 14 páginas.

    Cada página define su mensaje en el front matter:

      ---
      waMensaje: "Hola! Quiero más información sobre el LUMA Cart."
      ---

    Si no lo define, cae en `site.whatsapp_mensaje_default`. Ese default es
    deliberadamente amplio ("el equipamiento LUMA", no "las camillas"): lo
    usan las páginas que no son de un producto puntual (/, /nosotros/,
    /blog/, 404) y ahí el visitante puede venir por camillas, carritos o
    luminarias. No angostarlo a una sola línea de producto.

    Para un botón suelto que necesita SU propio mensaje (por ejemplo cada
    showroom en /nosotros/), está el filtro `waLink`:

      <a href="{{ 'Hola! Quiero agendar una visita.' | waLink }}">

    Como es dato computado, lo ven también los componentes compartidos
    (header, footer, cta-doble, showroom, botón flotante): renderizan
    dentro del contexto de la página, así que el mismo include sale con
    distinto mensaje en cada URL. Una sola fuente de verdad.
  */
  whatsappLink: (data) => linkWhatsapp(data.waMensaje),

  /*
    Ruta de migas de pan de la página, armada desde `page.url` con los
    rótulos de `_data/rutas.json` (ver _lib/migas.js).

    Es dato computado y no front matter por la misma razón que el link de
    WhatsApp: el componente `breadcrumbs.njk` se incluye desde el layout de
    producto y desde los dos hubs, y en los tres casos necesita saber en qué
    URL está renderizando. Una página que no figure en rutas.json recibe una
    lista vacía y el componente no dibuja nada.
  */
  migas: (data) => construirMigas(data.page.url, data.rutas),
};
