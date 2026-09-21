/* =============================================
   LUMA — Migas de pan (H-08)

   Arma la ruta caminando los segmentos de la URL hacia arriba y buscando
   el rótulo de cada nivel en _data/rutas.json.

     /camillas-electricas/premium/
       -> Inicio ~ Camillas eléctricas ~ LUMA Premium

   Si algún nivel no está declarado en rutas.json devuelve una lista vacía
   y el componente no renderiza nada. Ese es el mecanismo por el que
   /nosotros/, /garantia/ y la home quedan sin migas: no se las excluye
   desde el markup, simplemente no están en el mapa.

   Excepción: el ÚLTIMO nivel puede venir por parámetro (`migaActual`, del
   front matter de la página). Es para los posts del blog: cada artículo
   tiene su slug y no tiene sentido registrarlos uno por uno en rutas.json.
   Los niveles intermedios (/blog/) sí tienen que estar en el mapa.
   ============================================= */

function construirMigas(url, rutas, migaActual) {
  if (!url || url === "/" || !rutas) return [];

  const segmentos = url.split("/").filter(Boolean);
  if (segmentos.length === 0) return [];

  const migas = [{ url: "/", nombre: rutas["/"] || "Inicio" }];

  let acumulada = "";
  for (const [i, segmento] of segmentos.entries()) {
    acumulada += "/" + segmento;
    const nivel = acumulada + "/";
    const ultimo = i === segmentos.length - 1;
    const nombre = rutas[nivel] || (ultimo ? migaActual : null);
    if (!nombre) return [];
    migas.push({ url: nivel, nombre: nombre });
  }

  return migas.map((miga, i) => ({
    ...miga,
    actual: i === migas.length - 1,
  }));
}

module.exports = { construirMigas };
