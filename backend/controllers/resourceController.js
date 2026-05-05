const Resource = require('../models/Resource');
const Group = require('../models/Group');

// Crear un nuevo recurso
exports.createResource = async (req, res) => {
    const { nombre_recurso, descripcion, categoria, fotos, condiciones_uso, dias_max, hora_inicio, hora_fin, dias, punto_entrega, punto_devolucion } = req.body;
  
    try {
      // Verificar si el grupo existe
      const group = await Group.findById(req.body.grupo);
      if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });
  
      // Verificar permisos: Solo administrador principal o colaborador puede crear recursos
      if (!group.id_miembro_owner.equals(req.user.id) && !group.colaboradores.includes(req.user.id)) {
        return res.status(403).json({ error: 'No tienes permiso para crear recursos en este grupo' });
      }
  
      // Crear el nuevo recurso
      const newResource = new Resource({
        nombre_recurso,
        descripcion,
        categoria,
        propietario: req.user.id,
        grupo: req.body.grupo,
        fotos,
        condiciones_uso,
        dias_max,
        hora_inicio,
        hora_fin,
        dias,
        punto_entrega,
        punto_devolucion,
        estado: 'disponible'
      });
  
      await newResource.save();
      res.status(201).json({ mensaje: 'Recurso creado exitosamente', recurso: newResource });
    } catch (error) {
      console.error('Error al crear el recurso:', error);
      res.status(500).json({ error: 'Error al crear el recurso' });
    }
  };
  

// Obtener todos los recursos
exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('propietario', 'nombre email') // Poblar solo información básica del propietario
      .populate('grupo', 'nombre_grupo'); // Poblar solo información básica del grupo
    res.json(resources);
  } catch (error) {
    console.error('Error al obtener los recursos:', error);
    res.status(500).json({ error: 'Error al obtener los recursos' });
  }
};

// Obtener los detalles de un recurso específico
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('propietario', 'nombre email')
      .populate('grupo', 'nombre_grupo');
    if (!resource) return res.status(404).json({ error: 'Recurso no encontrado' });

    res.json(resource);
  } catch (error) {
    console.error('Error al obtener el recurso:', error);
    res.status(500).json({ error: 'Error al obtener el recurso' });
  }
};

// Actualizar la información de un recurso
exports.updateResource = async (req, res) => {
    const { descripcion, fotos, condiciones_uso, dias, punto_entrega, punto_devolucion } = req.body;
  
    try {
      const resource = await Resource.findById(req.params.id).populate('grupo');
      if (!resource) return res.status(404).json({ error: 'Recurso no encontrado' });
  
      // Verificar permisos: Solo administrador principal o colaborador puede actualizar recursos
      const group = resource.grupo;
      if (!group.id_miembro_owner.equals(req.user.id) && !group.colaboradores.includes(req.user.id)) {
        return res.status(403).json({ error: 'No tienes permiso para actualizar este recurso' });
      }
  
      // Actualizar los campos
      if (descripcion) resource.descripcion = descripcion;
      if (fotos) resource.fotos = fotos;
      if (condiciones_uso) resource.condiciones_uso = condiciones_uso;
      if (dias) resource.dias = dias;
      if (punto_entrega) resource.punto_entrega = punto_entrega;
      if (punto_devolucion) resource.punto_devolucion = punto_devolucion;
  
      await resource.save();
      res.json({ mensaje: 'Recurso actualizado', recurso: resource });
    } catch (error) {
      console.error('Error al actualizar el recurso:', error);
      res.status(500).json({ error: 'Error al actualizar el recurso' });
    }
  };
  

// Eliminar un recurso
exports.deleteResource = async (req, res) => {
  try {
      const resource = await Resource.findById(req.params.id).populate('grupo');
      if (!resource) return res.status(404).json({ error: 'Recurso no encontrado' });

      // Verificar permisos: Solo administrador principal o colaborador puede eliminar recursos
      const group = resource.grupo;
      if (!group.id_miembro_owner.equals(req.user.id) && !group.colaboradores.includes(req.user.id)) {
          return res.status(403).json({ error: 'No tienes permiso para eliminar este recurso' });
      }

      // Eliminar el recurso
      await Resource.deleteOne({ _id: resource._id });

      res.json({ mensaje: 'Recurso eliminado' });
  } catch (error) {
      console.error('Error al eliminar el recurso:', error);
      res.status(500).json({ error: 'Error al eliminar el recurso' });
  }
};

  

// Agregar una calificación a un recurso
exports.addResourceReview = async (req, res) => {
  const { puntaje, comentario } = req.body;
  const userId = req.user.id; // Usuario autenticado

  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Recurso no encontrado' });

    // Agregar la calificación al recurso
    const newReview = { puntaje, comentario, autor: userId, fecha: new Date() };
    resource.calificaciones.detalles.push(newReview);

    // Actualizar el total y promedio de calificaciones
    resource.calificaciones.total_calificaciones += 1;
    resource.calificaciones.promedio =
      (resource.calificaciones.promedio * (resource.calificaciones.total_calificaciones - 1) + puntaje) /
      resource.calificaciones.total_calificaciones;

    await resource.save();
    res.status(201).json({ mensaje: 'Calificación agregada al recurso', calificacion: newReview });
  } catch (error) {
    console.error('Error al agregar la calificación:', error);
    res.status(500).json({ error: 'Error al agregar la calificación al recurso' });
  }


};
