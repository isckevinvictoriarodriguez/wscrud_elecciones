const express = require("express");
const router = express.Router();
const Examen = require("../models/examen");
const mongoose = require("mongoose"); // 🔹 IMPORTAR mongoose


// // Crear un nuevo examen (Create)
// router.post("/nuevo-examen", async (req, res) => {
//   try {
//     const newExamen = new Examen(req.body);
//     const savedExamen = await newExamen.save();
//     // res.status(201).json(savedCurso);
//     res.status(201).send({ mensaje: "Examen registrado exitosamente!", examen: newExamen });
//   } catch (err) {
//     res.status(400).json({ message: "Error al registrar el examen " + err.message });
//   }
// });

router.post("/nuevo-examen", async (req, res) => {
  try {
    // Asignar el número de orden a las preguntas del examen
    if (req.body.questions && Array.isArray(req.body.questions)) {
      req.body.questions.forEach((question, index) => {
        // Asignar el orden como el índice + 1 (o simplemente index si empieza desde 0)
        question.orden = index; 
      });
    }

    // Crear el nuevo examen con el campo de orden asignado a las preguntas
    const newExamen = new Examen(req.body);
    const savedExamen = await newExamen.save();

    res.status(201).send({ mensaje: "Examen registrado exitosamente!", examen: savedExamen });
  } catch (err) {
    res.status(400).json({ message: "Error al registrar el examen " + err.message });
  }
});


// Leer todos los examenes (Read)
router.get("/", async (req, res) => {
  try {
    const examenes = await Examen.find();
    res.json(examenes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//ruta para obtener los datos de un examen por su _id (Read)
router.get("/get-examen/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const exa = await Examen.findById(_id); // Corrección aquí
      
      if (!exa) {
        return res.status(404).json({ message: "No se encontraron resultados para este examen" });
      }
      return res.json(exa); // Aseguramos que solo una respuesta se envíe
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener datos del examen", error });
  }
});



// Actualizar examen por ID
router.put("/examen-update/:_id", async (req, res) => {
  const { _id } = req.params;
  const updateData = req.body;

  try {
      const updatedExa = await Examen.findByIdAndUpdate(_id, updateData, { new: true });
      if (!updatedExa) {
          return res.status(404).json({ message: "Examen no encontrado" });
      }
     
        // console.log("usuario actualizado exitosamente!");
        res.status(201).send({ mensaje: "Examen Actualizado exitosamente!", Examen: updatedExa });
      
  } catch (error) {
      return res.status(500).json({ message: "Error al actualizar examen", error });
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
router.delete("/delete-examen/:id", async (req, res) => {

  const { id } = req.params;

  // Validar si el ID tiene el formato correcto de MongoDB
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID no válido" });
  }

  try {
    const examenEliminado = await Examen.findByIdAndDelete(id);

    if (!examenEliminado) {
      return res.status(404).json({ message: "Examen no encontrado" });
    }

    return res.json({ message: "Examen eliminado correctamente", examen: examenEliminado });
  } catch (err) {
    console.error("Error al eliminar el examen:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});


module.exports = router;
