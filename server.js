require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const schedule = require('node-schedule');
const { generarExcelEstructura2025 } = require('./extensions/estructura2025');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS
const corsOptions = {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());


// RESPUESTA SERVER
app.get('/', (req, res) => {
  res.status(200).send('Todo está funcionando correctamente');
});

// CONEXION A MONGODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Conexión a la base de datos exitosa"))
  .catch((err) => console.error("Error conectando a la base de datos:", err));

// RUTAS VOTACIONES
app.use("/api/personas", require("./routes/personas"));
app.use("/api/casillas", require("./routes/casillas"));
app.use("/api/areas", require("./routes/areas"));

// Ruta para descargar el archivo Excel
app.get('/descargar-excel', (req, res) => {
    const filePath = path.join(__dirname, 'archivos_EXCEL', 'estructura2025.xlsx');

    res.download(filePath, 'estructura2025.xlsx', (err) => {
        if (err) {
            console.error("❌ Error al enviar el archivo:", err);
            res.status(500).send('Error al descargar el archivo');
        } else {
            console.log("✅ Archivo enviado correctamente");
        }
    });
});

// CRON JOB //EXCEL POWERBI
schedule.scheduleJob('*/2 * * * *', () => {
    generarExcelEstructura2025()
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Servidor escuchando en el puerto 5000');
});