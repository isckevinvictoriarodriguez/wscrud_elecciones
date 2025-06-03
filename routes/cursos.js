const express = require("express");
const router = express.Router();
const Curso = require("../models/curso");
const User = require("../models/user");
const Examen = require("../models/examen");



// Crear un nuevo curso (Create)
router.post("/", async (req, res) => {
  try {

    const { title, description } = req.body;

    //validacion basica
    if (!title) {
      return res.status(400).json({ mensaje: "El titulo del curso es obligatorio..." })
    }

    //crear y guardar el curso en la base de datos

    const newCurso = new Curso({ title, description });
    await newCurso.save();
    // res.status(201).json(savedCurso);
    res.status(201).send({ mensaje: "Curso registrado exitosamente!", curso: newCurso });
  } catch (err) {
    res.status(400).json({ message: "Error al registrar el curso " + err.message });
  }
});


// Ruta para obtener info y cantidad de usuarios inscritos en cada curso
router.get("/", async (req, res) => {
  try {
    // Obtener todos los cursos disponibles
    const cursos = await Curso.find();

    // Verificar si hay cursos
    if (cursos.length === 0) {
      return res.status(404).json({ mensaje: "No hay cursos registrados." });
    }

    // Obtener la cantidad de alumnos inscritos en cada curso
    const cursosConCantidad = await Promise.all(
      cursos.map(async (curso) => {
        const cantidadUsuarios = await User.countDocuments({ coursesEnrolled: curso._id });
        // Buscar los exámenes relacionados con el curso
        const examenes = await Examen.find({ curso_id: curso._id });

          
        return {
          curso_id: curso._id,
          title: curso.title,
          description: curso.description,
          cantidadUsuarios: cantidadUsuarios,
          cantidadExamenes: examenes.length,  // Agregar el conteo de exámeness
          examenes: examenes
        };

        
      })
    );


    res.json(cursosConCantidad);
  } catch (error) {
    console.error("Error al obtener informacion por curso:", error);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
});




//ruta para obtener los datos de un usuario por su _id (Read)
router.get("/get-curso/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const curso = await Curso.findById(_id); // Corrección aquí
      
      if (!curso) {
        return res.status(404).json({ message: "No se encontraron resultados para este curso" });
      }
      return res.json(curso); // Aseguramos que solo una respuesta se envíe
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener datos del usuario", error });
  }
});


// Actualizar curso por ID
router.put("/curso-update/:_id", async (req, res) => {
  const { _id } = req.params;
  const updateData = req.body;

  try {
      const updatedCurso = await Curso.findByIdAndUpdate(_id, updateData, { new: true });
      if (!updatedCurso) {
          return res.status(404).json({ message: "Curso no encontrado" });
      }
     
        // console.log("usuario actualizado exitosamente!");
        res.status(201).send({ mensaje: "Curso Actualizado exitosamente!", Curso: updatedCurso });
      
  } catch (error) {
      return res.status(500).json({ message: "Error al actualizar usuario", error });
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
