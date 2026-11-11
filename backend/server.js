// API del formulario de contacto de Bite&Go.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// CORS: solo aceptamos peticiones desde los orígenes del frontend.
// El origen es solo el dominio, sin la ruta del repo.
app.use(cors({ origin: process.env.FRONTEND_URL.split(',') }));
app.use(express.json());

// Modelo: cómo se guarda cada mensaje en la base de datos.
const messageSchema = new mongoose.Schema({
  nombre:  { type: String, required: true, trim: true, maxlength: 100 },
  email:   { type: String, required: true, trim: true, lowercase: true },
  mensaje: { type: String, required: true, trim: true, maxlength: 1000 },
  fecha:   { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Ruta para comprobar que el servidor está vivo.
app.get('/', (req, res) => res.send('API Bite&Go funcionando'));

// Recibe el formulario. Se valida aquí aunque el HTML ya valide,
// porque el frontend se puede saltar desde fuera.
app.post('/api/contacto', async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'El correo no es válido.' });
  }

  try {
    await Message.create({ nombre, email, mensaje });
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Error guardando mensaje:', error);
    res.status(500).json({ error: 'Error del servidor. Inténtalo de nuevo.' });
  }
});

// Arrancamos el servidor solo cuando la base de datos conecta.
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 3000, () => console.log('Servidor listo'));
  })
  .catch((error) => console.error('No se pudo conectar a MongoDB:', error));

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log("Servidor listo", process.env.PORT);
        });
    })
    .catch((error) => {
        console.error("Error al conectar a MongoDB:", error);
    });
