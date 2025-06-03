const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  numempleado: { type: Number },
  grado: { type: String },
  role: { type: String },
  coursesEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Curso' }], // Array de ObjectId referenciando al modelo "Course"
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
