const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: String,
  contraseña: { type: String, required: true },
  rol: { type: String, default: 'miembro' },
  foto_perfil: String,
  grupos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  calificaciones: {
    total_calificaciones: { type: Number, default: 0 },
    promedio: { type: Number, default: 0 },
    detalles: [
      {
        puntaje: Number,
        comentario: String,
        autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fecha: { type: Date, default: Date.now }
      }
    ]
  }
});

module.exports = mongoose.model('User', userSchema);