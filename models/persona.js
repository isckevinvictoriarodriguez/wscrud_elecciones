const mongoose = require("mongoose");

const FotoSchema = new mongoose.Schema({
  imagen: { type: String, required: true },
  extension: { type: String, required: true }
}, { _id: false });

const responsableSchema = new mongoose.Schema({
  nombre: { type: String },
  telefono: { type: String },
  ce: { type: String }
}, { _id: false });

const movilizadorbleSchema = new mongoose.Schema({
  nombre: { type: String },
  telefono: { type: String },
  ce: { type: String},
  ceResp:  { type: String }
}, { _id: false });

const PersonaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    paterno: { type: String, required: true },
    materno: { type: String, required: true },
    area: { type: String, required: true },
    telefono: { type: String, required: true},
    whatsapp: { type: String, default: '' },

    nombreBusqueda: { type: String, default: '' },
    paternoBusqueda: { type: String, default: '' },
    maternoBusqueda: { type: String, default: '' },

    ce: { type: String, required: true },
    seccion: { type: String, required: true },
    sec_calle: { type: String, default: '' },
    sec_numero: { type: String, default: '' },
    sec_colonia: { type: String, default: '' },
    sec_municipio: { type: String, default: '' },
    sec_cp: { type: String, default: '' },
    sec_referencia: { type: String, default: '' },
    lat: { type: String },
    long: { type: String },
    link: { type: String },

    lider: { type: String, default: '' },
    responsable: [responsableSchema],
    movilizador: [movilizadorbleSchema],

    estatus: { type: String, required: true },
    fotos: [FotoSchema],
    adicional: { type: Boolean, default: false },
    rol: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Persona", PersonaSchema);
