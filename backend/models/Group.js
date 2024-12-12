const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    grupo_codigo: { type: String, required: true, unique: true, index: true },
    fecha_creado: { type: Date, default: Date.now },
    id_miembro_owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Administrador principal
    colaboradores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Colaboradores con privilegios similares
    grupo_privado: { type: Boolean, default: true },
    nombre_grupo: { type: String, required: true },
    foto_grupo: { type: String, default: 'https://img.freepik.com/vector-premium/hermoso-diseno-hogar-vector-vector-logo-icono-vector-clip-dibujos-animados_1277419-108.jpg' },
    tipo_comunidad: {
      type: [String],
      enum: ['barrio cerrado', 'edificio', 'coworking', 'universidad', 'otro'],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'El grupo debe tener al menos un tipo de comunidad'
      }
    },
    ubicacion: {
      latitud: { type: Number, required: true },
      longitud: { type: Number, required: true },
      direccion: { type: String }
    },
    miembros: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    recursos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }]
  },
  { timestamps: true }
);

// Propiedad virtual para la cantidad de miembros
groupSchema.virtual('cantidad_miembros').get(function () {
  return this.miembros.length;
});

module.exports = mongoose.model('Group', groupSchema);
