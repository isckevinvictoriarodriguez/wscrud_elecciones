const { writeFileSync } = require("fs");
const { readFileSync } = require("fs");
const path = require('path');
const fs = require("fs");
const uuid = require('uuid');
const Persona = require("../models/persona");

/**
 * Guarda un array de fotos en el disco y actualiza su ruta en el array original
 * @param {Array} fotos - Arreglo de objetos con imagen en base64 y extensión
 * @param {String} id - Identificador para usar en el nombre del archivo (opcional)
 * @returns {Array} - Arreglo actualizado con las rutas de archivo
 */
function guardarFotos(fotos, id = '') {
  if (!Array.isArray(fotos)) return [];

  // Definir la ruta absoluta de la carpeta "fotos"
  const dirFotos = path.join(__dirname, "../fotos");

  // Crear carpeta si no existe
  if (!fs.existsSync(dirFotos)) {
    fs.mkdirSync(dirFotos, { recursive: true });
  }

  return fotos.map((foto) => {
    if (!foto.imagen) {
      console.log("Sin imagen");
      return foto;
    }

    const buffer = Buffer.from(foto.imagen, "base64");
    const extension = foto.extension || "jpg";
    const nombreArchivo = `${id ? id + "-" : ""}${uuid.v1()}.${extension}`;

    // Ruta absoluta para guardar en disco (compatible Windows/Linux)
    const rutaSistema = path.join(dirFotos, nombreArchivo);

    try {
      writeFileSync(rutaSistema, buffer);

      // Ruta para guardar en Mongo / usar en web, relativa a la carpeta fotos y con /
      // Ejemplo: "fotos/uuid.jpeg"
      foto.imagen = path.posix.join("fotos", nombreArchivo);
    } catch (err) {
      console.error("Error al guardar imagen:", err);
    }

    return foto;
  });
}

/**
 * Agrega nuevas fotos a una persona existente, usando el campo `ce` como prefijo de nombre de archivo
 * @param {String} personaId - ID del documento de la persona
 * @param {Array} nuevasFotos - Arreglo de fotos en base64 con extensión
 * @returns {Object} - Persona actualizada
 */
async function agregarFotosPersona(personaId, nuevasFotos = []) {
  if (!personaId || !Array.isArray(nuevasFotos) || nuevasFotos.length === 0) {
    throw new Error("ID de persona y fotos válidas son requeridos");
  }

  // Buscar persona por ID
  const persona = await Persona.findById(personaId);
  if (!persona) {
    throw new Error("Persona no encontrada");
  }

  // Asegurarse de que tenga el campo `ce`
  if (!persona.ce) {
    throw new Error("La persona no tiene el campo 'ce' necesario para guardar las fotos");
  }

  // Guardar nuevas fotos en disco usando `ce` como identificador
  const fotosGuardadas = guardarFotos(nuevasFotos, persona.ce);

  // Agregar fotos nuevas al array existente
  persona.fotos.push(...fotosGuardadas);

  // Guardar cambios en MongoDB
  await persona.save();

  return persona;
}

/**
 * Reemplaza las fotos existentes de una persona por las nuevas fotos proporcionadas
 * @param {String} personaId - ID del documento de la persona
 * @param {Array} nuevasFotos - Arreglo de fotos en base64 con extensión
 * @returns {Object} - Persona actualizada
 */
async function reemplazarFotosPersona(personaId, nuevasFotos = []) {
  if (!personaId || !Array.isArray(nuevasFotos) || nuevasFotos.length === 0) {
    throw new Error("ID de persona y fotos válidas son requeridos");
  }

  // Buscar persona por ID
  const persona = await Persona.findById(personaId);
  if (!persona) {
    throw new Error("Persona no encontrada");
  }

  // Asegurarse de que tenga el campo `ce`
  if (!persona.ce) {
    throw new Error("La persona no tiene el campo 'ce' necesario para guardar las fotos");
  }

  // Guardar nuevas fotos en disco usando `ce` como identificador
  const fotosGuardadas = guardarFotos(nuevasFotos, persona.ce);

  // Reemplazar completamente el array de fotos con las nuevas fotos
  persona.fotos = fotosGuardadas;

  // Guardar cambios en MongoDB
  await persona.save();

  return persona;
}

function quitarAcentos(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}



module.exports = { quitarAcentos, guardarFotos, agregarFotosPersona, reemplazarFotosPersona }