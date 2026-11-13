// Lógica de pedidos sin dependencias de Express ni Mongoose,
// para poder probarla de forma aislada.
const { randomInt } = require('crypto');

const ESTADOS = ['pendiente', 'confirmado', 'preparando', 'entregado', 'cancelado'];
const TIPOS_ENTREGA = ['domicilio', 'recoger'];

const MAX_ITEMS_DISTINTOS = 20;
const MAX_CANTIDAD_POR_ITEM = 20;

// Catálogo base. Solo se usa si la colección de productos está vacía,
// igual que hace el frontend (src/data/productos.js).
const CATALOGO_INICIAL = [
  { id: 'clasica', nombre: 'Mini clásica', precio: '$12.000' },
  { id: 'bacon', nombre: 'Mini bacon crunch', precio: '$12.000' },
  { id: 'doble-queso', nombre: 'Mini double cheese', precio: '$14.000' }
];

// "$12.000" -> 12000. Los precios están en pesos colombianos, sin decimales.
function precioANumero(precio) {
  const digitos = String(precio ?? '').replace(/\D/g, '');
  return digitos ? parseInt(digitos, 10) : NaN;
}

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

// Valida el cuerpo de POST /api/pedidos.
// Devuelve { error } o { datos } con todo ya limpio.
function validarPedido(body) {
  const cuerpo = body && typeof body === 'object' ? body : {};

  const nombre = texto(cuerpo.nombre);
  if (!nombre || nombre.length > 100) {
    return { error: 'Escribe tu nombre (máximo 100 caracteres).' };
  }

  const telefono = texto(cuerpo.telefono).replace(/[\s().-]/g, '');
  if (!/^\+?\d{7,15}$/.test(telefono)) {
    return { error: 'Escribe un teléfono válido para poder contactarte.' };
  }

  const tipoEntrega = texto(cuerpo.tipoEntrega);
  if (!TIPOS_ENTREGA.includes(tipoEntrega)) {
    return { error: 'Elige si quieres domicilio o recoger en el local.' };
  }

  const direccion = texto(cuerpo.direccion);
  if (tipoEntrega === 'domicilio' && !direccion) {
    return { error: 'Escribe la dirección de entrega.' };
  }
  if (direccion.length > 200) {
    return { error: 'La dirección es demasiado larga (máximo 200 caracteres).' };
  }

  const notas = texto(cuerpo.notas);
  if (notas.length > 300) {
    return { error: 'Las notas son demasiado largas (máximo 300 caracteres).' };
  }

  if (!Array.isArray(cuerpo.items) || cuerpo.items.length === 0) {
    return { error: 'Tu pedido está vacío.' };
  }
  if (cuerpo.items.length > MAX_ITEMS_DISTINTOS) {
    return { error: 'Tu pedido tiene demasiados productos distintos.' };
  }

  // Une líneas repetidas del mismo producto.
  const cantidades = new Map();
  for (const item of cuerpo.items) {
    const id = texto(item && item.id);
    const cantidad = item && item.cantidad;

    if (!id || !Number.isInteger(cantidad) || cantidad < 1) {
      return { error: 'Hay un producto con datos inválidos en tu pedido.' };
    }

    const suma = (cantidades.get(id) || 0) + cantidad;
    if (suma > MAX_CANTIDAD_POR_ITEM) {
      return {
        error: `Puedes pedir máximo ${MAX_CANTIDAD_POR_ITEM} unidades de cada producto.`
      };
    }
    cantidades.set(id, suma);
  }

  return {
    datos: {
      nombre,
      telefono,
      tipoEntrega,
      direccion: tipoEntrega === 'domicilio' ? direccion : '',
      notas,
      cantidades: [...cantidades.entries()].map(([id, cantidad]) => ({ id, cantidad }))
    }
  };
}

// Cruza lo pedido con los productos reales y calcula el total.
// El precio SIEMPRE sale del catálogo del servidor, nunca del cliente.
// Devuelve { items, total } o { error, noDisponibles }.
function construirItems(cantidades, productos) {
  const porId = new Map(productos.map((producto) => [producto.id, producto]));
  const noDisponibles = [];
  const items = [];
  let total = 0;

  for (const { id, cantidad } of cantidades) {
    const producto = porId.get(id);
    const precioUnitario = producto ? precioANumero(producto.precio) : NaN;

    if (!producto || !Number.isFinite(precioUnitario) || precioUnitario <= 0) {
      noDisponibles.push(id);
      continue;
    }

    items.push({
      productoId: producto.id,
      nombre: producto.nombre,
      precioUnitario,
      cantidad
    });
    total += precioUnitario * cantidad;
  }

  if (noDisponibles.length > 0) {
    return {
      error: 'Algunos productos ya no están disponibles. Revisa tu pedido.',
      noDisponibles
    };
  }

  return { items, total };
}

// Código corto para que el cliente identifique su pedido: BG-7K2M9Q
const ALFABETO_CODIGO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin 0/O/1/I/L

function generarCodigo() {
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += ALFABETO_CODIGO[randomInt(ALFABETO_CODIGO.length)];
  }
  return `BG-${codigo}`;
}

module.exports = {
  ESTADOS,
  TIPOS_ENTREGA,
  CATALOGO_INICIAL,
  precioANumero,
  validarPedido,
  construirItems,
  generarCodigo
};
