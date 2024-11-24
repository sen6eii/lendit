const express = require('express');
const router = express.Router();
const {
  createLoan,
  getLoans,
  getLoan,
  getUserLoans,
  confirmLoanCompletion
} = require('../controllers/loanController');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware para autenticación

// Crear un nuevo préstamo
// Ruta: POST /api/loans
router.post('/', authMiddleware, createLoan);

// Obtener todos los préstamos
// Ruta: GET /api/loans
router.get('/', authMiddleware, getLoans);

// Obtener los detalles de un préstamo específico
// Ruta: GET /api/loans/:id
router.get('/:id', authMiddleware, getLoan);

// Ruta para obtener préstamos de un grupo específico
router.get('/group/:groupId', authMiddleware, checkAdminOrCollaborator, loanController.getGroupLoans);


// Obtener préstamos del usuario autenticado
// Ruta: GET /api/loans/user
router.get('/user', authMiddleware, getUserLoans);

// Confirmar finalización de un préstamo
// Ruta: PATCH /api/loans/:id/confirm
router.patch('/:id/confirm', authMiddleware, confirmLoanCompletion);

module.exports = router;
