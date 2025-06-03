const { quitarAcentos } = require("../extensions/utility");

function normalizarCampo(campo) {
  const limpio = campo?.trim() || '';
  const sinAcentos = quitarAcentos(limpio);
  return { limpio, sinAcentos };
}

function normalizarPersona(req, res, next) {
  const { nombre, paterno, materno } = req.body;

  // Normalizar campos (si vienen)
  const { limpio: nombreLimpio, sinAcentos: nombreBusqueda } = normalizarCampo(nombre);
  const { limpio: paternoLimpio, sinAcentos: paternoBusqueda } = normalizarCampo(paterno);
  const { limpio: maternoLimpio, sinAcentos: maternoBusqueda } = normalizarCampo(materno);

  // Reemplazar en req.body
  req.body.nombre = nombreLimpio;
  req.body.paterno = paternoLimpio;
  req.body.materno = maternoLimpio;

  req.body.nombreBusqueda = nombreBusqueda;
  req.body.paternoBusqueda = paternoBusqueda;
  req.body.maternoBusqueda = maternoBusqueda;

  next();
}

module.exports = normalizarPersona;
