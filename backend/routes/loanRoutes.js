const express = require('express');
const router = express.Router();

const {
  createLoan,
  getLoans,
  getLoan,
  getUserLoans,
  getOwnerLoans,
  getGroupLoans,
  approveLoan,
  denyLoan,
  cancelLoan,
  confirmLoanCompletion,
} = require('../controllers/loanController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, createLoan);
router.get('/', authMiddleware, getLoans);
router.get('/user', authMiddleware, getUserLoans);
router.get('/owner', authMiddleware, getOwnerLoans);
router.get('/group/:groupId', authMiddleware, getGroupLoans);
router.get('/:id', authMiddleware, getLoan);
router.patch('/:id/approve', authMiddleware, approveLoan);
router.patch('/:id/deny', authMiddleware, denyLoan);
router.patch('/:id/cancel', authMiddleware, cancelLoan);
router.patch('/:id/confirm', authMiddleware, confirmLoanCompletion);

module.exports = router;
