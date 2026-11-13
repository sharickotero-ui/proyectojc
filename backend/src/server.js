
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const {
  ESTADOS,
  CATALOGO_INICIAL,
  validarPedido,
  construirItems,
  generarCodigo
} = require('./pedidos');

const app = express();
// Render pone un proxy delante del servidor. Sin esto, el límite de
// intentos trataría a todos los visitantes como si fueran la misma persona.
app.set('trust proxy', 1);

// Render pone un proxy delante: así req.ip es la IP real del visitante.
app.set('trust proxy', 1);

const {
  PORT = 3000,
  MONGO_URI,
  FRONTEND_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH,
  JWT_SECRET,
  GEMINI_API_KEY,
  GEMINI_MODEL = 'gemini-flash-latest'
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

const orderSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true
  },
  cliente: {
    nombre: { type: String, required: true, trim: true, maxlength: 100 },
    telefono: { type: String, required: true, trim: true }
  },
  tipoEntrega: {
    type: String,
    enum: ['domicilio', 'recoger'],
    required: true
  },
  direccion: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  notas: {
    type: String,
    trim: true,
    maxlength: 300,
    default: ''
  },
  items: [{
    _id: false,
    productoId: { type: String, required: true },
    nombre: { type: String, required: true },
    precioUnitario: { type: Number, required: true, min: 0 },
    cantidad: { type: Number, required: true, min: 1 }
  }],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  estado: {
    type: String,
    enum: ESTADOS,
    default: 'pendiente'
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

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

const pedidoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Has enviado muchos pedidos seguidos. Inténtalo en unos minutos.'
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

// CREAR PEDIDO (público)

app.post('/api/pedidos', pedidoLimiter, async (req, res) => {
  const { error, datos } = validarPedido(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const ids = datos.cantidades.map(({ id }) => id);

    let productos = await Product.find({
      id: { $in: ids },
      disponible: true
    });

    // Si el catálogo de MongoDB aún está vacío, el menú muestra el catálogo
    // base; se acepta el pedido contra ese mismo catálogo.
    if (productos.length === 0 && (await Product.estimatedDocumentCount()) === 0) {
      productos = CATALOGO_INICIAL.filter(({ id }) => ids.includes(id));
    }

    const resultado = construirItems(datos.cantidades, productos);

    if (resultado.error) {
      return res.status(409).json({
        error: resultado.error,
        noDisponibles: resultado.noDisponibles
      });
    }

    let pedido = null;

    // El código es aleatorio; si choca con otro (muy improbable) se reintenta.
    for (let intento = 0; intento < 5 && !pedido; intento++) {
      try {
        pedido = await Order.create({
          codigo: generarCodigo(),
          cliente: {
            nombre: datos.nombre,
            telefono: datos.telefono
          },
          tipoEntrega: datos.tipoEntrega,
          direccion: datos.direccion,
          notas: datos.notas,
          items: resultado.items,
          total: resultado.total
        });
      } catch (errorCrear) {
        if (errorCrear.code !== 11000) throw errorCrear;
      }
    }

    if (!pedido) {
      throw new Error('No se pudo generar un código de pedido único.');
    }

    res.status(201).json({
      ok: true,
      codigo: pedido.codigo,
      total: pedido.total,
      estado: pedido.estado
    });

  } catch (errorPedido) {
    console.error('Error creando pedido:', errorPedido);

    res.status(500).json({
      error: 'No pudimos registrar tu pedido. Inténtalo de nuevo.'
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

// CHATBOT CON IA (Gemini)

// Máximo 10 mensajes por minuto por visitante, para cuidar la cuota gratis.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Estás escribiendo muy rápido. Espera un momento.'
  }
});

// Arma las instrucciones del bot con el menú real de la base de datos.
// Si el admin cambia un precio, el bot lo sabe en el siguiente mensaje.
function crearInstrucciones(productos) {
  const menu = productos.length > 0
    ? productos
        .map(p => `- ${p.nombre} (${p.precio}): ${p.descripcion}`)
        .join('\n')
    : 'El menú no está disponible en este momento.';

  return `Eres Biti, el asistente virtual de Bite&Go, un emprendimiento colombiano de mini hamburguesas. Nuestro lema: "Mini hamburguesas, máxima comodidad".

Tu tono: amigable, alegre y antojador, como alguien joven de Colombia. Respuestas cortas (máximo 3 o 4 frases). Puedes usar un emoji de vez en cuando 🍔.

Este es el menú actual:
${menu}

Reglas:
- Solo recomienda productos que estén en el menú de arriba, con su precio exacto.
- Nunca inventes productos, precios, promociones ni horarios.
- Si preguntan algo que no sabes (domicilios, horarios, pagos), invita a escribir por WhatsApp al 304 579 8707 o por el formulario de contacto.
- Si te hablan de temas que no tienen que ver con Bite&Go, responde con amabilidad que solo puedes ayudar con el menú y los pedidos.
- Responde siempre en español.
- No uses formato Markdown: nada de asteriscos ni almohadillas. Solo texto normal.`;
}

app.post('/api/chat', chatLimiter, async (req, res) => {
  const { mensaje, historial = [] } = req.body;

  // Validamos lo que llega antes de gastar cuota de la IA.
  if (typeof mensaje !== 'string' || !mensaje.trim()) {
    return res.status(400).json({ error: 'Escribe un mensaje.' });
  }

  if (mensaje.length > 500) {
    return res.status(400).json({ error: 'El mensaje es muy largo (máximo 500 caracteres).' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: 'El asistente no está configurado.' });
  }

  try {
    const productos = await Product.find({ disponible: true }).lean();

    // Gemini necesita la conversación anterior para recordar el contexto.
    // Enviamos solo los últimos 10 mensajes para no gastar de más.
    const conversacion = Array.isArray(historial)
      ? historial.slice(-10).map(m => ({
          role: m.rol === 'bot' ? 'model' : 'user',
          parts: [{ text: String(m.texto).slice(0, 500) }]
        }))
      : [];

    conversacion.push({ role: 'user', parts: [{ text: mensaje.trim() }] });

    const respuestaIA = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: crearInstrucciones(productos) }] },
          contents: conversacion,
          generationConfig: { temperature: 0.7 }
        })
      }
    );

    // 429 = se acabó la cuota gratis del momento.
    if (respuestaIA.status === 429 || respuestaIA.status === 503) {
      return res.status(429).json({
        error: 'Biti está descansando un momento. Inténtalo en un rato 🍔'
      });
    }

    if (!respuestaIA.ok) {
      console.error('Error de Gemini:', respuestaIA.status, await respuestaIA.text());
      return res.status(502).json({ error: 'El asistente no pudo responder.' });
    }

    const datos = await respuestaIA.json();
    const texto = datos.candidates?.[0]?.content?.parts
      ?.map(parte => parte.text || '')
      .join('')
      .trim();

    if (!texto) {
      return res.status(502).json({ error: 'El asistente no pudo responder.' });
    }

    res.json({ respuesta: texto });

  } catch (error) {
    console.error('Error en el chat:', error);
    res.status(500).json({ error: 'Error en el asistente.' });
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

// CONSULTAR PEDIDOS

app.get('/api/admin/pedidos', async (req, res) => {
  try {
    const filtro = {};

    if (typeof req.query.estado === 'string' && ESTADOS.includes(req.query.estado)) {
      filtro.estado = req.query.estado;
    }

    const pedidos = await Order.find(filtro)
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(pedidos);

  } catch (error) {
    res.status(500).json({
      error: 'Error consultando pedidos.'
    });
  }
});

// CAMBIAR ESTADO DE UN PEDIDO

app.put('/api/admin/pedidos/:id/estado', async (req, res) => {
  const { estado } = req.body;

  if (!ESTADOS.includes(estado)) {
    return res.status(400).json({
      error: 'Estado inválido.'
    });
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({
      error: 'Pedido no encontrado.'
    });
  }

  try {
    const pedido = await Order.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true, runValidators: true }
    );

    if (!pedido) {
      return res.status(404).json({
        error: 'Pedido no encontrado.'
      });
    }

    res.json(pedido);

  } catch (error) {
    res.status(500).json({
      error: 'Error actualizando el pedido.'
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
