const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Curso = require('../models/curso');
const mongoose = require("mongoose"); // 🔹 IMPORTAR mongoose



// Crear un nuevo usuario (Create)
router.post("/user-register", async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    // res.status(201).json(savedUser);
    res.status(201).send({ mensaje: "Usuario registrado exitosamente!", User: newUser });
  } catch (err) {
    res.status(400).json({ message:"Error al registrar el curso " + err.message });
  }
});

//ruta para obtener los datos de un usuario por su _id (Read)
router.get("/get-user/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const user = await User.findById(_id); // Corrección aquí
      
      if (!user) {
        return res.status(404).json({ message: "No se encontraron resultados para este usuario" });
      }
      return res.json(user); // Aseguramos que solo una respuesta se envíe
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener datos del usuario", error });
  }
});



// Actualizar usuario por ID
router.put("/user-update/:_id", async (req, res) => {
  const { _id } = req.params;
  const updateData = req.body;

  try {
      const updatedUser = await User.findByIdAndUpdate(_id, updateData, { new: true });
      if (!updatedUser) {
          return res.status(404).json({ message: "Usuario no encontrado" });
      }
     
        // console.log("usuario actualizado exitosamente!");
        res.status(201).send({ mensaje: "Usuario Actualizado exitosamente!", User: updatedUser });
      
  } catch (error) {
      return res.status(500).json({ message: "Error al actualizar usuario", error });
  }
});



// Leer todos los usuarios (Read)
router.get("/get-users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// // Eliminar un item por ID (Delete)
router.delete("/delete-user/:id", async (req, res) => {

  const { id } = req.params;

  // Validar si el ID tiene el formato correcto de MongoDB
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID no válido" });
  }

  try {
    const userEliminado = await User.findByIdAndDelete(id);

    if (!userEliminado) {
      return res.status(404).json({ message: "User no encontrado" });
    }

    return res.json({ message: "User eliminado correctamente", examen: userEliminado });
  } catch (err) {
    console.error("Error al eliminar el examen:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
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
