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
   ============================================= */

function construirMigas(url, rutas) {
  if (!url || url === "/" || !rutas) return [];

  const segmentos = url.split("/").filter(Boolean);
  if (segmentos.length === 0) return [];

  const migas = [{ url: "/", nombre: rutas["/"] || "Inicio" }];

  let acumulada = "";
  for (const segmento of segmentos) {
    acumulada += "/" + segmento;
    const nivel = acumulada + "/";
    const nombre = rutas[nivel];
    if (!nombre) return [];
    migas.push({ url: nivel, nombre: nombre });
  }

  return migas.map((miga, i) => ({
    ...miga,
    actual: i === migas.length - 1,
  }));
}

module.exports = { construirMigas };
