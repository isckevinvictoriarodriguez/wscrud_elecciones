const fs = require('fs');
const path = require('path');
const XlsxPopulate = require('xlsx-populate');
const Persona = require('../models/persona');

// Función principal
function generarExcelEstructura2025() {
    const aggregation = [
        {
            $lookup: {
                from: "casillas",
                localField: "seccion",
                foreignField: "SECCION",
                as: "areaInfo"
            }
        },
        {
            $unwind: {
                path: "$areaInfo",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                fullName: {
                    $concat: [
                        "$nombre",
                        " ",
                        "$paterno",
                        " ",
                        "$materno"
                    ]
                },
                ce: 1,
                seccion: 1,
                fullAddress: {
                    $concat: [
                        "$sec_calle",
                        " ",
                        "$sec_numero",
                        " ",
                        "$sec_colonia",
                        " ",
                        "$sec_municipio",
                        " ",
                        "$sec_cp"
                    ]
                },
                area: 1,
                lider: 1,
                responsable: {
                    $arrayElemAt: ["$responsable.nombre", 0]
                },
                movilizador: {
                    $arrayElemAt: ["$movilizador.nombre", 0]
                },
                lat: 1,
                long: 1,
                link: 1,
                estatus: 1,
                sec_referencia: 1,
                distrito_federal: "$areaInfo.Distrito Federal",
                distrito_judicial: "$areaInfo.Distrito Judicial",
                distrito_local: "$areaInfo.Distrito Local",
                circuito_judicial: "$areaInfo.Circuito Judicial",
                zona: "$areaInfo.ZONA",
            }
        }
    ];

    Persona.aggregate(aggregation)
        .then(resp => {
            if (resp.length === 0) {
                console.log("⚠️ aggregation sin resultados!");
                return;
            }

            // 🔍 Determinar ruta de guardado según entorno
            const isProduccion = process.env.MONGO_URI === 'mongodb://localhost:27000/Votaciones';

            let dirPath;
            if (isProduccion) {
                // Linux - Ruta absoluta
                dirPath = '/mnt/windows-intercambio';
            } else {
                // Windows - Carpeta dentro del proyecto
                dirPath = path.join(__dirname, '../archivos_EXCEL');
            }

            const filePath = path.join(dirPath, 'estructura2025.xlsx');

            console.log("🌐 Entorno:", isProduccion ? "PRODUCCIÓN (Linux)" : "LOCAL (Windows)");
            console.log("📁 Ruta donde se guardará el archivo:", filePath);

            // Crear carpeta si no existe
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log("📂 Carpeta creada:", dirPath);
            }

            const cell = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
            const head = [
                "NOMBRE_INVITADO", "CLAVE_ELECTOR", "ANFITRION", "TEL_ANFITRION",
                "SECCION_ELECTORAL", "DIRECCION", "UBICACION", "REFERENCIA",
                "COORDS_CASILLA", "URL", "STATUS", "AREA", "LIDER", "RESPONSABLE", 
                "MOVILIZADOR", "DISTRITO_FEDERAL", "DISTRITO_JUDICIAL", "DISTRITO_LOCAL", 
                "CIRCUITO_JUDICIAL", "ZONA"
            ];

            return XlsxPopulate.fromBlankAsync()
                .then(workbook => {
                    const sheet = workbook.sheet(0);

                    // Encabezados
                    for (let i = 0; i < cell.length; i++) {
                        sheet.cell(`${cell[i]}1`).value(head[i]);
                        sheet.column(cell[i]).width(20);
                    }

                    // Cuerpo del Excel
                    for (let i = 0; i < resp.length; i++) {
                        const r = resp[i];
                        sheet.cell(`A${i + 2}`).value(r.fullName || '');
                        sheet.cell(`B${i + 2}`).value(r.ce || '');
                        sheet.cell(`C${i + 2}`).value("SIN DATOS");
                        sheet.cell(`D${i + 2}`).value("SIN DATOS");
                        sheet.cell(`E${i + 2}`).value(r.seccion || '');
                        sheet.cell(`F${i + 2}`).value(r.fullAddress || '');
                        sheet.cell(`G${i + 2}`).value("SIN DATOS");
                        sheet.cell(`H${i + 2}`).value(r.sec_referencia || '');
                        sheet.cell(`I${i + 2}`).value(`${r.lat || ''},${r.long || ''}`);
                        sheet.cell(`J${i + 2}`).value(r.link || '');
                        sheet.cell(`K${i + 2}`).value(r.estatus || '');

                        sheet.cell(`L${i + 2}`).value(r.area || '');
                        sheet.cell(`M${i + 2}`).value(r.lider || '');
                        sheet.cell(`N${i + 2}`).value(r.responsable || '');
                        sheet.cell(`O${i + 2}`).value(r.movilizador || '');
                        sheet.cell(`P${i + 2}`).value(r.distrito_federal || '');
                        sheet.cell(`Q${i + 2}`).value(r.distrito_judicial || '');
                        sheet.cell(`R${i + 2}`).value(r.distrito_local || '');
                        sheet.cell(`S${i + 2}`).value(r.circuito_judicial || '');
                        sheet.cell(`T${i + 2}`).value(r.zona || '');
                    }

                    // Guardar archivo
                    return workbook.toFileAsync(filePath);
                })
                .then(() => {
                    console.log("✅ Archivo Excel generado con éxito:", filePath);
                })
                .catch(err => {
                    console.error("❌ Error al generar el archivo Excel:", err);
                });
        })
        .catch(err => {
            console.error("❌ Error en aggregation:", err);
        });
}

module.exports = { generarExcelEstructura2025 }
