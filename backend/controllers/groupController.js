const Group = require('../models/Group');
const User = require('../models/User');
const Resource = require('../models/Resource');

// Función auxiliar: Verificar permisos
const hasPermission = (group, userId) => {
  return group.id_miembro_owner.equals(userId) || group.colaboradores.includes(userId);
};

// Crear un nuevo grupo
exports.createGroup = async (req, res) => {
  const { grupo_codigo, nombre_grupo, tipo_comunidad, ubicacion, grupo_privado } = req.body;

  try {
    const newGroup = new Group({
      grupo_codigo,
      nombre_grupo,
      tipo_comunidad,
      ubicacion,
      grupo_privado,
      id_miembro_owner: req.user.id,
      miembros: [req.user.id]
    });

    await newGroup.save();

    // Agregar el grupo al usuario creador
    await User.findByIdAndUpdate(req.user.id, { $push: { grupos: newGroup._id } });

    res.status(201).json({ mensaje: 'Grupo creado exitosamente', grupo: newGroup });
  } catch (error) {
    console.error('Error al crear el grupo:', error);
    res.status(500).json({ error: 'Error al crear el grupo' });
  }
};

// Obtener información de todos los grupos
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('miembros', 'nombre email')
      .populate('recursos');
    res.json(groups);
  } catch (error) {
    console.error('Error al obtener los grupos:', error);
    res.status(500).json({ error: 'Error al obtener los grupos' });
  }
};

// Obtener información de un grupo específico
exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('miembros', 'nombre email')
      .populate('colaboradores', 'nombre email')
      .populate('id_miembro_owner', 'nombre email');

    if (!group) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error al obtener el grupo:', error);
    res.status(500).json({ error: 'Error al obtener el grupo' });
  }
};

// Agregar un miembro al grupo
exports.addMemberToGroup = async (req, res) => {
  const { groupId } = req.params;
  const { miembro_id } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

    if (!hasPermission(group, req.user.id)) {
      return res.status(403).json({ error: 'No tienes permiso para añadir miembros a este grupo' });
    }

    if (group.miembros.includes(miembro_id)) {
      return res.status(400).json({ error: 'El usuario ya es miembro del grupo' });
    }

    group.miembros.push(miembro_id);
    await group.save();

    await User.findByIdAndUpdate(miembro_id, { $push: { grupos: group._id } });

    res.json({ mensaje: 'Miembro agregado al grupo', grupo: group });
  } catch (error) {
    console.error('Error al agregar miembro al grupo:', error);
    res.status(500).json({ error: 'Error al agregar miembro al grupo' });
  }
};

// Eliminar un miembro del grupo
exports.removeMemberFromGroup = async (req, res) => {
  const { groupId } = req.params;
  const { miembro_id } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

    if (!hasPermission(group, req.user.id)) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar miembros de este grupo' });
    }

    if (!group.miembros.includes(miembro_id)) {
      return res.status(404).json({ error: 'El usuario no es miembro del grupo' });
    }

    group.miembros = group.miembros.filter((id) => id.toString() !== miembro_id);
    await group.save();

    await User.findByIdAndUpdate(miembro_id, { $pull: { grupos: group._id } });

    res.json({ mensaje: 'Miembro eliminado del grupo', grupo: group });
  } catch (error) {
    console.error('Error al eliminar miembro del grupo:', error);
    res.status(500).json({ error: 'Error al eliminar miembro del grupo' });
  }
};

// Añadir un colaborador al grupo
exports.addCollaborator = async (req, res) => {
  const { groupId } = req.params;
  const { colaborador_id } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

    if (!group.id_miembro_owner.equals(req.user.id)) {
      return res.status(403).json({ error: 'Solo el administrador principal puede añadir colaboradores' });
    }

    if (group.colaboradores.includes(colaborador_id)) {
      return res.status(400).json({ error: 'El usuario ya es colaborador' });
    }

    group.colaboradores.push(colaborador_id);
    await group.save();

    res.json({ mensaje: 'Colaborador añadido al grupo', grupo: group });
  } catch (error) {
    console.error('Error al añadir colaborador:', error);
    res.status(500).json({ error: 'Error al añadir colaborador al grupo' });
  }
};

// Eliminar un colaborador del grupo
exports.removeCollaborator = async (req, res) => {
  const { groupId } = req.params;
  const { colaborador_id } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

    if (!hasPermission(group, req.user.id)) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar colaboradores' });
    }

    if (!group.colaboradores.includes(colaborador_id)) {
      return res.status(404).json({ error: 'El usuario no es colaborador' });
    }

    group.colaboradores = group.colaboradores.filter((id) => id.toString() !== colaborador_id);
    await group.save();

    res.json({ mensaje: 'Colaborador eliminado del grupo', grupo: group });
  } catch (error) {
    console.error('Error al eliminar colaborador:', error);
    res.status(500).json({ error: 'Error al eliminar colaborador del grupo' });
  }
};
