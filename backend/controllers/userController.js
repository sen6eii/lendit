const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registro de usuario
exports.registerUser = async (req, res) => {
  const { nombre, email, contraseña, telefono } = req.body;

  try {
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear usuario
    const user = new User({
      nombre,
      email,
      contraseña: hashedPassword,
      telefono
    });

    const savedUser = await user.save();


    res.status(201).json({
      mensaje: 'Usuario registrado',
      id: user._id, // Devuelve el ID generado
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// Login de usuario
exports.loginUser = async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    // Verificar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(contraseña, user.contraseña);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    // Generar JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Devolver el token y el ID del usuario
    res.json({
      token,
      id: user._id, // Agregar el ID del usuario en la respuesta
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};


// Obtener un usuario específico
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('grupos');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(user);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// Actualizar la información de un usuario
exports.updateUser = async (req, res) => {
  const { nombre, telefono, foto_perfil } = req.body;

  try {
    // Validar que el usuario autenticado está editando su propia cuenta
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'No tienes permiso para editar este usuario' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { nombre, telefono, foto_perfil },
      { new: true } // Devuelve el documento actualizado
    );

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ mensaje: 'Usuario actualizado', usuario: user });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

// Agregar una calificación a un usuario
exports.addUserReview = async (req, res) => {
  const { puntaje, comentario } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Agregar la calificación al usuario
    const newReview = {
      puntaje,
      comentario,
      autor: req.user.id, // El ID del usuario autenticado que está calificando
      fecha: new Date()
    };
    user.calificaciones.detalles.push(newReview);

    // Actualizar el total y promedio de calificaciones
    user.calificaciones.total_calificaciones += 1;
    user.calificaciones.promedio =
      (user.calificaciones.promedio * (user.calificaciones.total_calificaciones - 1) + puntaje) /
      user.calificaciones.total_calificaciones;

    await user.save();
    res.status(201).json({ mensaje: 'Calificación agregada al usuario', calificacion: newReview });
  } catch (error) {
    console.error('Error al agregar la calificación al usuario:', error);
    res.status(500).json({ error: 'Error al agregar la calificación al usuario' });
  }
};
