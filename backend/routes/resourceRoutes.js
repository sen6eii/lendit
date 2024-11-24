const express = require('express');
const router = express.Router();
const {
  createResource,
  getResources,
  getResource,
  updateResource,
  deleteResource,
  updateResourceStatus,
  addResourceReview
} = require('../controllers/resourceController');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware para autenticación

// Crear un nuevo recurso
// Ruta: POST /api/resources
// Requiere autenticación
router.post('/', authMiddleware, createResource);

// Obtener todos los recursos
// Ruta: GET /api/resources
// Requiere autenticación
router.get('/', authMiddleware, getResources);

// Obtener los detalles de un recurso específico
// Ruta: GET /api/resources/:id
// Requiere autenticación
router.get('/:id', authMiddleware, getResource);

// Actualizar la información de un recurso
// Ruta: PATCH /api/resources/:id
// Requiere autenticación
router.patch('/:id', authMiddleware, updateResource);

// Eliminar un recurso
// Ruta: DELETE /api/resources/:id
// Requiere autenticación
router.delete('/:id', authMiddleware, deleteResource);

// Actualizar el estado de un recurso (por ejemplo, disponible o en préstamo)
// Ruta: PATCH /api/resources/:resourceId/status
// Requiere autenticación
router.patch('/:resourceId/status', authMiddleware, updateResourceStatus);

// Agregar una calificación a un recurso
// Ruta: POST /api/resources/:id/reviews
// Requiere autenticación
router.post('/:id/reviews', authMiddleware, addResourceReview);

module.exports = router;
