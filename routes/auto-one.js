const express = require ("express");
const router = express.Router();
const mongoose = require ("mongoose");

const User = require("../models/user");
const Examen = require ("../models/examen");
const Respuesta = require ("../models/examenanswer");

//ruta para responder un examen automaticamente
router.post("/responder-automatico/:usuarioId/:examenId", async (req, res)=>{
    try{
        const { usuarioId, examenId} = req.params;
        // console.log(`usuarioId: ${usuarioId}, examenId: ${examenId}`);

        //Buscar usuario y examen

        const usuario = await User.findById(usuarioId);
        const examen= await Examen.findById(examenId);
        if(!usuario || !examen){
            console.log(`Usuario o examen no encontrado - Usuario: ${usuarioId}, Examen: ${examenId}`);
            return res.status(404).json({mensaje: "usuario o examen no encontrado"});            
        }

        //generar respuestas automaticas
        const respuestas = examen.questions.map(p => ({
            pregunta: p.pregunta,
            respuesta: p.correctAnswer,
            correcta: true
        }));

        //calcular el puntaje
        const puntaje = respuestas.length;
        const total_preguntas = examen.questions.length;

        //guardar en la base de datos
        const nuevaRespuesta = new Respuesta({
            usuario_id: usuario._id,
            examen_id:examen._id,
            respuestas,
            puntaje,
            total_preguntas
        });

        await nuevaRespuesta.save();
        res.json({mensaje: "Examen respondido automaticamente", nuevaRespuesta});
    } catch (error){
        res.status(500).json({mensaje:"Error al procesar la solicitud", error});
    }
});


module.exports=router;