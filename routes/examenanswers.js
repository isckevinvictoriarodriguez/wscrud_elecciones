const express = require("express");
const router = express.Router();
const ExamenAnswers = require("../models/examenanswer");

// Crear un nuevo usuario (Create)
router.post("/", async (req, res) => {
  try {
    const newAnswers = new ExamenAnswers(req.body);
    const savedExamen = await newAnswers.save();
    // res.status(201).json(savedCurso);
    res.status(201).send("Respuestas registradas exitosamente!");
  } catch (err) {
    res.status(400).json({ message: "Error al registrar respuestas "+ err.message });
  }
});

// Leer todas las respuestas de los examenes filtradas por curso_id y examen_id (Read)
router.get("/get-ans/:curso_id/:examen_id", async (req, res) => {
  try {
      const { curso_id, examen_id } = req.params;
      const resultados = await ExamenAnswers.find({ curso_id, examen_id })
                                           .populate('usuario_id', 'name')
                                           .populate('curso_id', 'title')
                                           .populate('examen_id', 'title');
      if (!resultados) {
          return res.status(404).json({ message: 'No se encontraron resultados' });
      }
      return res.json(resultados); // Aseguramos que solo una respuesta se envíe
  } catch (error) {
      return res.status(500).json({ message: 'Error al obtener los resultados', error });
  }
});

//ruta para obtener las respuestas de un examen por su _id (Read)
router.get("/get-ans/:_id", async (req, res) => {
  try {
      const {_id } = req.params;
      const resultados = await ExamenAnswers.find({ _id })
      .populate('usuario_id', 'name')
      .populate('curso_id', 'title')
      .populate('examen_id', 'title');
      
      if (resultados.length === 0) {
        return res.status(404).json({ message: "No se encontraron resultados para este examen" });
      }
      return res.json(resultados); // Aseguramos que solo una respuesta se envíe
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener los resultados", error });
  }
});


// // Actualizar un item por ID (Update)
// router.put("/:id", async (req, res) => {
//   try {
//     const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(updatedItem);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // Eliminar un item por ID (Delete)
// router.delete("/:id", async (req, res) => {
//   try {
//     await Item.findByIdAndDelete(req.params.id);
//     res.json({ message: "Item eliminado" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

module.exports = router;
