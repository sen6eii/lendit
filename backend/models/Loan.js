const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  recurso_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  prestatario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fecha_inicio: { type: Date, required: true },
  fecha_fin: { type: Date, required: true },
  estado: { type: String, enum: ['pendiente', 'en curso', 'finalizado', 'retrasado'], default: 'pendiente' }
});

module.exports = mongoose.model('Loan', loanSchema);
