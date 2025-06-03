const mongoose = require("mongoose");

const responsableSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  ce: { type: String, required: true }
}, { _id: false });

const movilizadorbleSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  ce: { type: String, required: true },
  ceResp:  { type: String, required: true }
}, { _id: false });

const AreaSchema = new mongoose.Schema({
    nombreArea: { type: String },
    lider: { type: String },
    responsable: [responsableSchema],
    movilizador: [movilizadorbleSchema]
});

module.exports = mongoose.model("Area", AreaSchema);
