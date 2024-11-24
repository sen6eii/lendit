const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUser, updateUser, addUserReview } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); // Importar el middleware de autenticación

// Ruta de registro (No requiere autenticación)
router.post('/register', registerUser);

// Ruta de login (No requiere autenticación)
router.post('/login', loginUser);

// Obtener un usuario específico (Requiere autenticación)
router.get('/:id', authMiddleware, getUser);

// Actualizar la información de un usuario (Requiere autenticación)
router.patch('/:id', authMiddleware, updateUser);

// Agregar una calificación a un usuario (Requiere autenticación)
router.post('/:id/reviews', authMiddleware, addUserReview);

module.exports = router;
