const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const routes = require('./routes'); // Importa las rutas organizadas en index.js
const cron = require('node-cron');
const updateLoanStates = require('./utils/updateLoanStates');
require('dotenv').config();
const path = require('path');

const app = express();

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*', // Permite el dominio configurado en CLIENT_URL o todos los orígenes
    credentials: true,
  })
);
app.use(express.json());

// Rutas principales
app.use('/api', routes); // Las rutas organizadas estarán bajo el prefijo /api

// Ruta base de ejemplo
app.get('/', (req, res) => {
  res.send('API de LendIt corriendo correctamente');
});

// Manejo de errores globales (opcional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal, intenta nuevamente.' });
});

// Ejecutar cada hora para actualizar los estados de los préstamos
cron.schedule('0 * * * *', async () => {
  console.log('Ejecutando tarea programada para actualizar estados de préstamos');
  try {
    await updateLoanStates();
    console.log('Tarea completada con éxito');
  } catch (error) {
    console.error('Error al ejecutar la tarea programada:', error);
  }
});



// Puerto del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
