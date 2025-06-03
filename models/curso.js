const mongoose = require("mongoose");

const CursoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  // teacherId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cursos' }], // Array de ObjectId referenciando al modelo "Course"
  // studentsId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // Array de ObjectId referenciando al modelo "Course"
  // examsId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // Array de ObjectId referenciando al modelo "Course"
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Curso", CursoSchema);
