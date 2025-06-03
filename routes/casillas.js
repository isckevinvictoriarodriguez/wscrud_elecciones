const express = require("express");
const router = express.Router();
const Casilla = require("../models/casilla");

/* Obtener seccion de casilla
    Busqueda por seccion
*/
router.post('/buscar-seccion', async (req, res) => {
  const { seccion } = req.body;

  if (!seccion) {
    return res.status(400).json({ error: 'Debe proporcionar el codigo de sección' });
  }

  try {
    const casilla = await Casilla.findOne({ SECCION: seccion});
    if (!casilla) {
      return res.status(200).json(null);
    }

    res.json(casilla);
  } catch (error) {
    console.error("Error al obtener sección:", error);
    res.status(500).json({
      error: 'Error interno al obtener la sección',
      detalle: error.message
    });
  }
});


module.exports = router;