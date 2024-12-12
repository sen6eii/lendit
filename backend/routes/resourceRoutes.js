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
const { authMiddleware } = require('../middlewares/authMiddleware');

// Crear un nuevo recurso
router.post('/', authMiddleware, createResource);

// Obtener todos los recursos
router.get('/', authMiddleware, getResources);

// Obtener los detalles de un recurso específico
router.get('/:id', authMiddleware, getResource);

// Actualizar la información de un recurso
router.patch('/:id', authMiddleware, updateResource);

// Eliminar un recurso
router.delete('/:id', authMiddleware, deleteResource);

// Agregar una calificación a un recurso
router.post('/:id/reviews', authMiddleware, addResourceReview);

module.exports = router;
