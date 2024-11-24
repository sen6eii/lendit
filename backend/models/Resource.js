const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  nombre_recurso: { type: String, required: true },
  unidades: { type: Number, default: 1 },
  descripcion: { type: Object, required: true }, // Almacena el formato Delta JSON de Quill.js
  categoria: { type: [String], enum: ['jardinería', 'bricolaje', 'cocina', 'otros'], required: true },
  propietario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  grupo: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  fotos: { type: [String] }, // URLs de las fotos del recurso
  URLs_tutorial: { type: [String] },
  condiciones_uso: { type: Object }, // Almacena el formato Delta JSON de Quill.js
  dias_max: { type: Number },
  hora_inicio: { type: String },
  hora_fin: { type: String },
  dias: { type: [String] }, // Lista de días en los que el recurso está disponible
  punto_entrega: {
    texto: { type: String },
    ubicacion: {
      latitud: { type: Number },
      longitud: { type: Number }
    }
  },
  punto_devolucion: {
    texto: { type: String },
    ubicacion: {
      latitud: { type: Number },
      longitud: { type: Number }
    }
  },
  estado: { type: String, enum: ['disponible', 'en préstamo'], default: 'disponible' },
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

module.exports = mongoose.model('Resource', resourceSchema);
