require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, { family: 4 });
      console.log('MongoDB conectado');
    } catch (error) {
      console.error('Error al conectar a MongoDB:', error);
      process.exit(1); // Salir del proceso con fallo
    }
  };
  
  module.exports = connectDB;