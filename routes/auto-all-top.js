const express = require ("express");
const router = express.Router();
const mongoose = require ("mongoose");

const User = require("../models/user");
const Examen = require ("../models/examen");
const Respuesta = require ("../models/examenanswer");

// Ruta para responder automáticamente los exámenes de todos los usuarios de un curso específico (por ID)
router.post("/responder-automatico/curso/:cursoId", async (req, res)=>{
    try{
        const { cursoId} = req.params;
        

        // Buscar todos los usuarios que están inscritos en ese curso (por ID)
        const usuarios = await User.find({coursesEnrolled: cursoId});
        if(usuarios.length===0){
            return res.status(404).json({mensaje: "No hay usuarios inscritos en este curso"});    
           
        
        }

            // Buscar todos los exámenes relacionados con ese curso (por ID)
            const examenes = await Examen.find({ curso_id: cursoId });
            if (examenes.length === 0) {
                return res.status(404).json({ mensaje: "No hay exámenes disponibles para este curso" });
            }

            let respuestasGuardadas = [];

     // Iterar sobre cada usuario y cada examen para generar respuestas automáticas
     for (const usuario of usuarios) {
        for (const examen of examenes) {
            const respuestas = examen.questions.map(p => ({
                pregunta: p.pregunta,
                respuesta: p.correctAnswer,
                correcta: true
            }));

            // Calcular puntaje
            const puntaje = respuestas.length;
            const total_preguntas = examen.questions.length;

            // Guardar en la base de datos
            const nuevaRespuesta = new Respuesta({
                usuario_id: usuario._id,
                examen_id: examen._id,
                respuestas,
                puntaje,
                total_preguntas
            });

            await nuevaRespuesta.save();
            respuestasGuardadas.push(nuevaRespuesta);
        }
    }

    res.json({ mensaje: "Exámenes respondidos automáticamente", respuestas: respuestasGuardadas });

} catch (error) {
    res.status(500).json({ mensaje: "Error al procesar la solicitud", error });
}
});

module.exports = router;