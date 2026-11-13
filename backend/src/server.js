
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();

const {
  PORT = 3000,
  MONGO_URI,
  FRONTEND_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH,
  JWT_SECRET
} = process.env;

// Validar configuración
if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD_HASH || !JWT_SECRET) {
  throw new Error('Faltan variables de entorno obligatorias.');
}

// Middlewares
const allowedOrigins = (FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Origen no permitido por CORS'));
  }
}));

app.use(express.json({ limit: '20kb' }));

// MODELOS

const messageSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  mensaje: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', messageSchema);

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  precio: {
    type: String,
    required: true,
    trim: true
  },
  imagen: {
    type: String,
    required: true,
    trim: true
  },
  alt: {
    type: String,
    required: true,
    trim: true
  },
  disponible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

// AUTENTICACIÓN

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiados intentos. Inténtalo más tarde.'
  }
});

function verificarToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No autorizado.'
    });
  }

  const token = authorization.split(' ')[1];

  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o expirado.'
    });
  }
}

// RUTAS PÚBLICAS

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Bite&Go funcionando'
  });
});

// LOGIN ADMINISTRADOR

app.post('/api/admin/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: 'Correo y contraseña obligatorios.'
      });
    }

    const correoValido =
      email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();

    const passwordValida = await bcrypt.compare(
      password,
      ADMIN_PASSWORD_HASH
    );

    if (!correoValido || !passwordValida) {
      return res.status(401).json({
        error: 'Credenciales incorrectas.'
      });
    }

    const token = jwt.sign(
      {
        role: 'admin',
        email: ADMIN_EMAIL
      },
      JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    res.json({
      ok: true,
      token,
      usuario: ADMIN_EMAIL
    });

  } catch (error) {
    console.error('Error en login:', error);

    res.status(500).json({
      error: 'Error al iniciar sesión.'
    });
  }
});

// CONSULTAR PRODUCTOS PÚBLICOS

app.get('/api/productos', async (req, res) => {
  try {
    const productos = await Product.find({
      disponible: true
    }).sort({ createdAt: -1 });

    res.json(productos);

  } catch (error) {
    res.status(500).json({
      error: 'Error consultando productos.'
    });
  }
});

// FORMULARIO DE CONTACTO

app.post('/api/contacto', async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  if (
    typeof nombre !== 'string' ||
    typeof email !== 'string' ||
    typeof mensaje !== 'string' ||
    !nombre.trim() ||
    !email.trim() ||
    !mensaje.trim()
  ) {
    return res.status(400).json({
      error: 'Todos los campos son obligatorios.'
    });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({
      error: 'Correo inválido.'
    });
  }

  try {
    await Message.create({
      nombre,
      email,
      mensaje
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Mensaje recibido correctamente.'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Error guardando el mensaje.'
    });
  }
});

// RUTAS PRIVADAS DE ADMINISTRACIÓN

app.use('/api/admin', verificarToken);

// CONSULTAR TODOS LOS PRODUCTOS

app.get('/api/admin/productos', async (req, res) => {
  try {
    const productos = await Product.find().sort({
      createdAt: -1
    });

    res.json(productos);

  } catch (error) {
    res.status(500).json({
      error: 'Error consultando productos.'
    });
  }
});

// CREAR PRODUCTO

app.post('/api/admin/productos', async (req, res) => {
  try {
    const {
      id,
      nombre,
      descripcion,
      precio,
      imagen,
      alt
    } = req.body;

    if (
      !id ||
      !nombre ||
      !descripcion ||
      precio === undefined ||
      !imagen ||
      !alt
    ) {
      return res.status(400).json({
        error: 'Completa todos los campos.'
      });
    }

    const producto = await Product.create({
      id,
      nombre,
      descripcion,
      precio: String(precio),
      imagen,
      alt
    });

    res.status(201).json(producto);

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Ya existe un producto con ese identificador.'
      });
    }

    res.status(500).json({
      error: 'Error creando producto.'
    });
  }
});

// EDITAR PRODUCTO

app.put('/api/admin/productos/:id', async (req, res) => {
  try {
    const camposPermitidos = [
      'nombre',
      'descripcion',
      'precio',
      'imagen',
      'alt',
      'disponible'
    ];

    const cambios = {};

    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        cambios[campo] = campo === 'precio'
          ? String(req.body[campo])
          : req.body[campo];
      }
    }

    const producto = await Product.findOneAndUpdate(
      { id: req.params.id },
      cambios,
      {
        new: true,
        runValidators: true
      }
    );

    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado.'
      });
    }

    res.json(producto);

  } catch (error) {
    res.status(500).json({
      error: 'Error actualizando producto.'
    });
  }
});

// ELIMINAR PRODUCTO

app.delete('/api/admin/productos/:id', async (req, res) => {
  try {
    const producto = await Product.findOneAndDelete({
      id: req.params.id
    });

    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado.'
      });
    }

    res.json({
      ok: true,
      mensaje: 'Producto eliminado.'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error eliminando producto.'
    });
  }
});

// CONSULTAR MENSAJES DE CONTACTO

app.get('/api/admin/mensajes', async (req, res) => {
  try {
    const mensajes = await Message.find().sort({
      fecha: -1
    });

    res.json(mensajes);

  } catch (error) {
    res.status(500).json({
      error: 'Error consultando mensajes.'
    });
  }
});

// MANEJO DE ERRORES

app.use((error, req, res, next) => {
  console.error(error.message);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    error: 'Error interno del servidor.'
  });
});

// CONEXIÓN A MONGODB

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado correctamente');

    app.listen(PORT, () => {
      console.log(`Servidor listo en el puerto ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error conectando MongoDB:', error);
    process.exit(1);
  });
