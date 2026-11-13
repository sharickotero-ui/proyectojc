// Todos los fetch de la página viven aquí.
// VITE_API_URL sale de frontend/.env.development (local) o .env.production (Render).
const API_URL = import.meta.env.VITE_API_URL;
console.log('URL DEL BACKEND:', API_URL)
// Envía el formulario de contacto a la API.
// Recibe { nombre, email, mensaje } y lanza un Error si algo sale mal.
export async function enviarContacto(datos) {
  const response = await fetch(`${API_URL}/api/contacto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  const resultado = await response.json()

  if (!response.ok) throw new Error(resultado.error || 'Error desconocido')

  return resultado
}

export async function obtenerProductos() {
  const respuesta = await fetch(`${API_URL}/api/productos`);

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los productos');
  }

  return await respuesta.json();
}


export async function iniciarSesionAdmin(datos) {
  const response = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos),
  })

  const resultado = await response.json()

  if (!response.ok) {
    throw new Error(resultado.error || 'No fue posible iniciar sesión')
  }

  return resultado
}

// Obtener todos los productos para el administrador
export async function obtenerProductosAdmin() {
  const response = await fetch(`${API_URL}/api/admin/productos`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('adminToken')}`,
    },
  })

  const resultado = await response.json()

  if (!response.ok) {
    throw new Error(resultado.error || 'Error consultando productos')
  }

  return resultado
}

// Crear un producto
export async function crearProducto(datos) {
  const response = await fetch(`${API_URL}/api/admin/productos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('adminToken')}`,
    },
    body: JSON.stringify(datos),
  })

  const resultado = await response.json()

  if (!response.ok) {
    throw new Error(resultado.error || 'Error creando producto')
  }

  return resultado
}

// Actualizar un producto
export async function actualizarProducto(id, datos) {
  const response = await fetch(
    `${API_URL}/api/admin/productos/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify(datos),
    }
  )

  const resultado = await response.json()

  if (!response.ok) {
    throw new Error(resultado.error || 'Error actualizando producto')
  }

  return resultado
}

// Eliminar un producto
export async function eliminarProducto(id) {
  const response = await fetch(
    `${API_URL}/api/admin/productos/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('adminToken')}`,
      },
    }
  )

  const resultado = await response.json()

  if (!response.ok) {
    throw new Error(resultado.error || 'Error eliminando producto')
  }

  return resultado
}



export async function obtenerMensajesAdmin() {
  const response = await fetch(`${API_URL}/api/admin/mensajes`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('adminToken')}`,
    },
  })

  const resultado = await response.json()

  if (!response.ok) {
    throw new Error(resultado.error || 'Error consultando mensajes')
  }

  return resultado
}
