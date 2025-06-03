const mongoose = require("mongoose");

const ExamenSchema = new mongoose.Schema({
  
  title: {type: String, required: true},
  curso_id:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Curso'  }],
  description: {type: String},
  questions: [
    {
    question: { type: String},
    options: [{type: String}],
    correctAnswer: {type: String},
    orden: { type: Number },
  }
],
  // totalScore: {type: String},
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Examen", ExamenSchema);
