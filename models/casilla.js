const mongoose = require("mongoose");

const CasillaSchema = new mongoose.Schema({
    SECCION: { type: String },
    CALLE: { type: String },
    NUMERO: { type: String },
    COLONIA: { type: String },
    MUNICIPIO: { type: String},
    CODIGO_POSTAL: { type: String },
    REFERENCIA: { type: String },
    UBICACION: { type: String },
    ZONA: { type: String },
    LAT: { type: Number },
    LONG: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Casilla", CasillaSchema);
