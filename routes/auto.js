//esta ruta esta relacionada con la ruta de examenanswers.js, hace uso de examens para obtener 
// los examenes y de examenanswers para obtener las respuestas de los examenes


const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const Examen = require("../models/examen");
const Respuesta = require("../models/examenanswer");

// Ruta para responder automáticamente los exámenes con puntajes variados
router.post("/responder-automatico/curso/:cursoId", async (req, res) => {
    try {
        const { cursoId } = req.params;
        // Buscar los usuarios inscritos en el curso
        const usuarios = await User.find({ coursesEnrolled: cursoId });
        if (usuarios.length === 0) {
            return res.status(404).json({ mensaje: "No hay usuarios inscritos en este curso" });
        }
        // Buscar los exámenes relacionados con ese curso
        const examenes = await Examen.find({ curso_id: cursoId });
        if (examenes.length === 0) {
            return res.status(404).json({ mensaje: "No hay exámenes disponibles para este curso" });
        }
        
        let respuestasGuardadas = [];
        // Para cada usuario, responder automáticamente cada examen
        for (const usuario of usuarios) {
            for (const examen of examenes) {
                const total_preguntas = examen.questions.length;
                // Elegir un porcentaje de aciertos aleatorio entre 70, 80, 90 y 100
                const porcentajesDisponibles = [ 0.7, 0.8, 0.9, 1.0];
                const porcentajeSeleccionado = porcentajesDisponibles[Math.floor(Math.random() * porcentajesDisponibles.length)];
                const minimo_aciertos = parseInt(total_preguntas * porcentajeSeleccionado);
                console.log(`Usuario ${usuario.name} responderá el examen ${examen.title} con al menos ${minimo_aciertos} aciertos.`);
                
                let respuestas = [];
                let aciertos = 0;
                //-----------> obtener respuesas previas del usuario en este examen
                const respuestasPrevias = await Respuesta.findOne({
                    usuario_id: usuario._id,
                    examen_id: examen._id
                });
                let preguntasYaRespondidas = respuestasPrevias
                    ? respuestasPrevias.respuestas.map(r => r.pregunta) // Extraemos solo los textos de las preguntas ya respondidas
                    : [];
                //Filtrar preguntas que ya fueron respondidas
                let preguntasFiltradas = examen.questions.filter(pregunta =>
                    !preguntasYaRespondidas.includes(pregunta.question) // Excluye preguntas ya respondidas
                );
                // Si ya se respondieron todas las preguntas, no hacer nada
                if (preguntasFiltradas.length === 0) {
                    console.log(`Usuario ${usuario.name} ya ha respondido el examen ${examen.title}.`);
                    continue;
                }
                // Barajar las preguntas para hacer aleatorio qué preguntas se aciertan
                let preguntasDesordenadas = [...examen.questions].sort(() => Math.random() - 0.5);
                for (const pregunta of preguntasDesordenadas) {
                    let respuestaCorrecta = pregunta.correctAnswer;
                    let respuestaSeleccionada;
                    // Si aún no se ha alcanzado el número de aciertos requeridos, responder correctamente
                    if (aciertos < minimo_aciertos) {
                        respuestaSeleccionada = respuestaCorrecta;
                        aciertos++;                        
                    } else {
                        // Para el resto, responder incorrectamente con una opción al azar
                        const opcionesIncorrectas = pregunta.options.filter(op => op !== respuestaCorrecta);
                        respuestaSeleccionada = opcionesIncorrectas[Math.floor(Math.random() * opcionesIncorrectas.length)];
                    }
                    //console.log(aciertos); // Verifica si está obteniendo el valor de orden correctamente
                    respuestas.push({
                        pregunta: pregunta.question,
                        respuesta: respuestaSeleccionada,
                        options: pregunta.options,
                        correcta: respuestaSeleccionada === respuestaCorrecta,
                        orden: pregunta.orden
                    });
                }
                // Mezclar respuestas para que no queden las incorrectas al final
                // respuestas.sort(() => Math.random() - 0.5);
                respuestas.sort((a, b) => a.orden - b.orden);
                // console.log(respuestas);
                // Calcular puntaje final
                const puntaje = respuestas.filter(r => r.correcta).length;            
                const calificacion = Math.round(((puntaje / total_preguntas) * 100)/10);
                console.log("Esta es la calificacion obtenida "+calificacion);
                // console.log("Este es el puntaje obtenido "+puntaje+ " de "+total_preguntas);   
                // Guardar solo si supera el 70% de aciertos
                if (calificacion >= 7) {
                    const nuevaRespuesta = new Respuesta({
                        usuario_id: usuario._id,
                        examen_id: examen._id,
                        curso_id: examen.curso_id,
                        respuestas,
                        puntaje: calificacion,
                        total_preguntas: puntaje  //preguntas respondidas bien                    
                    });
                    // console.log(nuevaRespuesta);
                    await nuevaRespuesta.save();
                    respuestasGuardadas.push(nuevaRespuesta);
                }
            }
        }
        console.log("Respuestas guardadas Satisfactoriamente!");
        res.status(200).json({ ResponseCode: -1, mensaje: "Exámenes respondidos automáticamente con puntajes variados", respuestas: respuestasGuardadas });
    } catch (error) {
        console.log('Error interno del servidor:', error);  // Registra el error completo
        // res.status(500).json({
        //     mensaje: 'Error al procesar la solicitud',
        //     error: {
        //         message: error.message,
        //         stack: error.stack
        //     }
        // });
    }
});

module.exports = router;
