const express = require("express");
const router = express.Router();
const Persona = require("../models/persona");
const Area = require("../models/area");
const { guardarFotos, agregarFotosPersona, reemplazarFotosPersona } = require("../extensions/utility");
const normalizarPersona = require("../middleware/nomalizarPersona");
const fs = require('fs');
const path = require('path');

// ========================== VOTACIONES ==========================

/* Obtener all
*/
router.get("/", async (req, res) => {
  try {
    const personas = await Persona.find();

    if (personas.length === 0) {
      return res.status(404).json({ mensaje: "No hay personas registradas." });
    }

    res.json(personas);
  } catch (error) {
    console.error("Error al obtener informacion de personas:", error);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
});

/* Obtener jerarquia
*/
router.post('/persona-jerarquia', async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.status(400).json({ error: 'Debe proporcionar el _id de la persona' });
  }

  try {
    const persona = await Persona.findById(_id);
    if (!persona) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }

    const nombreCompleto = `${persona.nombre} ${persona.paterno} ${persona.materno}`.toUpperCase().trim();
    const personasMap = new Map();
    personasMap.set(persona._id.toString(), persona.toObject());

    // Reutilizable: buscar relacionados por nombre en campos anidados
    const buscarRelacionados = async (rol, campo) => {
      const relacionados = await Persona.find({
        [campo]: {
          $elemMatch: {
            nombre: nombreCompleto
          }
        }
      });

      relacionados.forEach(rel => {
        personasMap.set(rel._id.toString(), rel.toObject());
      });
    };

    // MOVILIZADOR
    if (persona.rol === 'MOVILIZADOR') {
      await buscarRelacionados('MOVILIZADOR', 'movilizador');
    }

    // RESPONSABLE
    if (persona.rol === 'RESPONSABLE') {
      await buscarRelacionados('RESPONSABLE', 'responsable');
    }

    // LIDER
    if (persona.rol === 'LIDER') {
      const area = await Area.findOne({ lider: nombreCompleto });
      // console.log("Area del lider -> ", area);
      
      if (area) {
        const responsables = area.responsable || [];
        const movilizadores = area.movilizador || [];

        const subconsultas = [];

        responsables.forEach(r => {
          // console.log(r.nombre);
          
          subconsultas.push(
            Persona.find({
              responsable: { $elemMatch: { nombre: r.nombre } }
            }).then(resps => {
              resps.forEach(r => {
                personasMap.set(r._id.toString(), r.toObject());
              });
            })
          );
        });

        movilizadores.forEach(m => {
          subconsultas.push(
            Persona.find({
              movilizador: { $elemMatch: { nombre: m.nombre } }
            }).then(movs => {
              movs.forEach(m => {
                personasMap.set(m._id.toString(), m.toObject());
              });
            })
          );
        });
        // console.log("Subconsultas -> ", subconsultas);

        // console.log("personasMap -> ", personasMap.values);
        
        
        await Promise.all(subconsultas);
      }
    }

    const resultado = Array.from(personasMap.values());
    return res.json(resultado);
  } catch (error) {
    console.error('Error al obtener jerarquía:', error);
    return res.status(500).json({
      error: 'Error interno al obtener la jerarquía',
      detalle: error.message
    });
  }
});

/* Actualizar 
    @id 
*/
router.put("/persona-update/:_id", async (req, res) => {
  const { _id } = req.params;
  const { fotos = [], ...restoDeDatos } = req.body;

  try {
    // 1. Actualizar campos de la persona (sin tocar fotos aún)
    const personaActualizada = await Persona.findByIdAndUpdate(
      _id,
      restoDeDatos,
      { new: true }
    );

    if (!personaActualizada) {
      return res.status(404).json({ message: "Persona no encontrada" });
    }

    // 2. Si hay fotos nuevas, reemplazarlas en lugar de agregarlas
    if (Array.isArray(fotos) && fotos.length > 0) {
      await reemplazarFotosPersona(_id, fotos);
    }

    // 3. Obtener la persona actualizada con las fotos incluidas
    const personaFinal = await Persona.findById(_id);

    res.status(200).json({
      mensaje: "Persona actualizada exitosamente!",
      persona: personaFinal
    });

  } catch (error) {
    console.error("Error al actualizar persona:", error);
    res.status(500).json({
      mensaje: "Error al actualizar persona",
      error: error.message
    });
  }
});

/* Crear 
    @data 
*/
router.post("/", normalizarPersona, async (req, res) => {
  try {
    const { nombre, paterno, materno, ce, fotos = [] } = req.body;

    if (!nombre || !paterno || !materno || !ce) {
      return res.status(400).json({
        mensaje: "nombre, paterno, materno, clave electoral son necesarios para crear registro de persona"
      });
    }

    // Guardar fotos en disco y actualizar rutas
    req.body.fotos = guardarFotos(fotos, ce);

    const nuevaPersona = new Persona(req.body);
    await nuevaPersona.save();

    res.status(201).json({
      mensaje: "Persona registrada exitosamente!",
      persona: nuevaPersona
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({
      mensaje: "Error al registrar persona: " + err.message
    });
  }
});

//ESTABLE: [CONSULTAS] NOMBRES LIDER, RESPONSABLE, MOVILIZADOR
router.post('/buscar', normalizarPersona, async (req, res) => {
  try {
    const { nombreBusqueda, paternoBusqueda, maternoBusqueda } = req.body;

    if (!nombreBusqueda && !paternoBusqueda && !maternoBusqueda) {
      return res.status(400).json({
        error: 'Debe proporcionar al menos un campo de búsqueda: nombre, paterno o materno.',
      });
    }

    const filtro = {};
    if (nombreBusqueda) filtro.nombreBusqueda = new RegExp(nombreBusqueda, 'i');
    if (paternoBusqueda) filtro.paternoBusqueda = new RegExp(paternoBusqueda, 'i');
    if (maternoBusqueda) filtro.maternoBusqueda = new RegExp(maternoBusqueda, 'i');

    // Buscar las personas que coincidan con el filtro
    const personas = await Persona.find(filtro).sort({ paterno: 1, materno: 1, nombre: 1 });

   /*  // Ejecutar las consultas de manera concurrente para los campos "lider", "responsable", "movilizador"
    const personasConDatos = await Promise.all(personas.map(async (persona) => {
      const personaModificada = { ...persona.toObject() };

      const [lider, responsable, movilizador] = await Promise.all([
        persona.lider ? Persona.findOne({ identificador: persona.lider }) : null,
        persona.responsable ? Persona.findOne({ identificador: persona.responsable }) : null,
        persona.movilizador ? Persona.findOne({ identificador: persona.movilizador }) : null
      ]);

      personaModificada.lider = lider
        ? `${lider.nombre} ${lider.paterno} ${lider.materno}`
        : 'SIN DATOS';

      personaModificada.responsable = responsable
        ? `${responsable.nombre} ${responsable.paterno} ${responsable.materno}`
        : 'SIN DATOS';

      personaModificada.movilizador = movilizador
        ? `${movilizador.nombre} ${movilizador.paterno} ${movilizador.materno}`
        : 'SIN DATOS';

      return personaModificada;
    })); */

    res.json(personas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar personas' });
  }
});


/* Filtro x estatus
  @estatus: PENDIENTE | PROCESO | COMPLETO | REGISTRADO
*/
router.post('/por-estatus', async (req, res) => {
  try {
    const { estatus, pagina = 1, orden = 'AZ' } = req.body;

    // console.log("REQUEST X ESTATUS -> ", estatus, pagina, orden);
    

    const estatusValido = ['PENDIENTE','PROCESO','COMPLETO', 'REGISTRADO'];
    if (!estatusValido.includes(estatus)) {
      return res.status(400).json({
        error: 'Estatus inválido. Debe ser PENDIENTE, PROCESO, COMPLETO o REGISTRADO.'
      });
    }

    const ordenValido = ['AZ', 'ZA'];
    if (!ordenValido.includes(orden)) {
      return res.status(400).json({
        error: 'Orden inválido. Debe ser "AZ" o "ZA".'
      });
    }

    const limite = 30;
    const skip = (pagina - 1) * limite;

    // Define el orden dinámicamente
    const direccion = orden === 'AZ' ? 1 : -1;
    const sortOrder = { paterno: direccion, materno: direccion, nombre: direccion };

    // Ejecutar la búsqueda
    const filtro = { estatus };
    const personas = await Persona.find(filtro)
      .sort(sortOrder)
      .skip(skip)
      .limit(limite);

    const total = await Persona.countDocuments(filtro);

    res.json({
      total,
      paginaActual: pagina,
      totalPaginas: Math.ceil(total / limite),
      orden,
      resultados: personas
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener registros por estatus.' });
  }
});

/* obtener imagen
  @_id (persona)
*/

router.post('/imagenes', async (req, res) => {
  try {
    const { _id } = req.body;
    
    const persona = await Persona.findById(_id);

    if (!persona) {
      return res.status(404).json({ error: 'Persona no encontrada.' });
    }

    if (!Array.isArray(persona.fotos) || persona.fotos.length === 0) {
      return res.json({ imagenes: [] });
    }

    const fotos = persona.fotos.map(f => {
      const ruta = path.join(__dirname, '..', f.imagen); // ajusta el path según tu estructura
      let base64 = '';

      try {
        const buffer = fs.readFileSync(ruta);
        base64 = `data:image/${f.extension};base64,${buffer.toString('base64')}`;
      } catch (err) {
        console.warn(`No se pudo leer la imagen en ${ruta}:`, err);
      }

      return {
        imagen: base64,
        extension: f.extension
      };
    });

    res.json({ fotos });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener imágenes.' });
  }
});



module.exports = router;