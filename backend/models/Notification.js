const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  usuario_destinatario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: { type: String, required: true },
  mensaje: { type: String, required: true },
  leida: { type: Boolean, default: false },
  referencia_id: { type: mongoose.Schema.Types.ObjectId },
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
