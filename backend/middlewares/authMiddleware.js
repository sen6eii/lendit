const jwt = require('jsonwebtoken');
const Group = require('../models/Group'); // Importa el modelo Group si no lo has hecho

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
      console.log('No se proporcionó un token.');
      return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
  }

  try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
      console.log('Usuario autenticado desde el middleware:', req.user); // <-- Depuración
      next();
  } catch (error) {
      console.log('Token inválido.');
      res.status(401).json({ error: 'Token inválido.' });
  }
};

// Middleware para verificar si es administrador o colaborador
const checkAdminOrCollaborator = async (req, res, next) => {
  try {
    const { id: groupId } = req.params; // ID del grupo
    const userId = req.user.id; // ID del usuario autenticado

    // Buscar el grupo
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

    // Verificar si el usuario es administrador o colaborador
    const isAuthorized =
      group.id_miembro_owner.equals(userId) || group.colaboradores.includes(userId);

    if (!isAuthorized) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
    }

    next(); // Usuario autorizado, continuar
  } catch (error) {
    console.error('Error en checkAdminOrCollaborator:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  authMiddleware,
  checkAdminOrCollaborator
};
