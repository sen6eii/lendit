const { jwtVerify } = require('jose');
const Group = require('../models/Group');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido.' });
  }
};

const checkAdminOrCollaborator = async (req, res, next) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

    const isAuthorized =
      group.id_miembro_owner.equals(userId) || group.colaboradores.includes(userId);

    if (!isAuthorized) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
    }

    next();
  } catch (error) {
    console.error('Error en checkAdminOrCollaborator:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { authMiddleware, checkAdminOrCollaborator };
