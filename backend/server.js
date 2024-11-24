const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const routes = require('./routes'); // Importa las rutas organizadas en index.js

require('dotenv').config();
const cron = require('node-cron');
const updateLoanStates = require('./utils/updateLoanStates');

const app = express();

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // Habilitar CORS (ajusta el dominio en producción)
app.use(express.json());

// Rutas principales
app.use('/api', routes); // Las rutas organizadas estarán bajo el prefijo /api

// Ruta base de ejemplo
app.get('/', (req, res) => {
  res.send('API de LendIt');
});

// Manejo de errores globales (opcional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal, intenta nuevamente.' });
});

// Ejecutar cada hora para actualizar los estados de los préstamos
cron.schedule('0 * * * *', async () => {
    console.log('Ejecutando tarea programada para actualizar estados de préstamos');
    await updateLoanStates();
  });

// Puerto del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));

