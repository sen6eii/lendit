const express = require('express');
const router = express.Router();
const {
    createGroup,
    getGroups,
    getGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    addCollaborator,
    removeCollaborator,
} = require('../controllers/groupController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Crear un nuevo grupo
// Ruta: POST /api/groups
// Requiere autenticación
router.post('/', authMiddleware, createGroup);

// Obtener todos los grupos
// Ruta: GET /api/groups
// Requiere autenticación
router.get('/', authMiddleware, getGroups);

// Obtener información de un grupo específico
// Ruta: GET /api/groups/:groupId
// Requiere autenticación
router.get('/:groupId', authMiddleware, getGroup);

// Añadir un miembro a un grupo
// Ruta: POST /api/groups/:groupId/members
// Requiere autenticación
router.post('/:groupId/members', authMiddleware, addMemberToGroup);

// Eliminar un miembro de un grupo
// Ruta: DELETE /api/groups/:groupId/members
// Requiere autenticación
router.delete('/:groupId/members', authMiddleware, removeMemberFromGroup);

// Añadir un colaborador a un grupo
// Ruta: POST /api/groups/:groupId/collaborators
// Requiere autenticación
router.post('/:groupId/collaborators', authMiddleware, addCollaborator);

// Eliminar un colaborador de un grupo
// Ruta: DELETE /api/groups/:groupId/collaborators
// Requiere autenticación
router.delete('/:groupId/collaborators', authMiddleware, removeCollaborator);

module.exports = router;
