const mongoose = require("mongoose");


  const respuestaSchema = new mongoose.Schema({
    pregunta: { type: String },
    respuesta: { type: String, required: true },
    options: [{type: String}],
    correcta: { type: Boolean, required: true },
    orden: { type: Number }
  });
  
  const ExamenAnswerSchema = new mongoose.Schema({
    usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    examen_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Examen', required: true },
    curso_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'Curso', required: true  },

    respuestas: [respuestaSchema],
    puntaje: { type: Number, required: true },
    total_preguntas: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
  });


module.exports = mongoose.model("ExamenAnswer", ExamenAnswerSchema);
