const express = require("express");
const router = express.Router();
const Area = require("../models/area");

/* Obtener all
*/
router.get("/", async (req, res) => {
  try {
    const area = await Area.find();

    if (area.length === 0) {
      return res.status(404).json({ mensaje: "No hay areas registradas." });
    }

    res.json(area);
  } catch (error) {
    console.error("Error al obtener informacion de areas:", error);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
});


module.exports = router;