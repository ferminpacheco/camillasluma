/* =============================================
   DIMENSIONES DE IMAGEN — helper compartido

   Lo usan _data/congresos.js y el filtro `galeriaClientes` de
   .eleventy.js. Una sola implementación para leer ancho y alto reales
   de un archivo y emitir width/height en el <img> (sin CLS).
   ============================================= */

const fs = require("fs");

/* Dimensiones reales del archivo, para poder emitir width/height y que
   el carrusel no salte mientras cargan las fotos (CLS).
   Se leen los primeros bytes del archivo: alcanza para WebP, PNG y JPEG
   y evita sumar una dependencia de imágenes al build. */
function dimensiones(rutaAbsoluta) {
  let fd;
  try {
    fd = fs.openSync(rutaAbsoluta, "r");
    const buf = Buffer.alloc(64 * 1024);
    const leidos = fs.readSync(fd, buf, 0, buf.length, 0);
    const b = buf.subarray(0, leidos);

    // PNG: IHDR arranca en el byte 16.
    if (b.length > 24 && b.toString("ascii", 1, 4) === "PNG") {
      return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    }

    // WebP: RIFF....WEBP + un chunk VP8 / VP8L / VP8X.
    if (b.length > 30 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
      const tipo = b.toString("ascii", 12, 16);

      if (tipo === "VP8 ") {
        // Frame header: los 14 bits bajos de cada uno son el tamaño.
        return {
          width: b.readUInt16LE(26) & 0x3fff,
          height: b.readUInt16LE(28) & 0x3fff,
        };
      }
      if (tipo === "VP8L") {
        // 14 bits para el ancho y 14 para el alto, empaquetados, base 0.
        const bits = b.readUInt32LE(21);
        return {
          width: (bits & 0x3fff) + 1,
          height: ((bits >> 14) & 0x3fff) + 1,
        };
      }
      if (tipo === "VP8X") {
        // Canvas size: dos enteros de 24 bits little-endian, base 0.
        return {
          width: (b[24] | (b[25] << 8) | (b[26] << 16)) + 1,
          height: (b[27] | (b[28] << 8) | (b[29] << 16)) + 1,
        };
      }
    }

    // JPEG: recorrer los markers hasta un SOFn, que trae alto y ancho.
    if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length - 9) {
        if (b[i] !== 0xff) { i++; continue; }
        const marker = b[i + 1];
        // SOF0-SOF15, salteando los que no son de frame (C4, C8, CC).
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
        }
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
  } catch (e) {
    // Un archivo ilegible no debe romper el build entero.
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }

  return null;
}

module.exports = { dimensiones };
