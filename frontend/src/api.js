// Todos los fetch de la página viven aquí.
// VITE_API_URL sale de frontend/.env.development (local) o .env.production (Render).
const API_URL = import.meta.env.VITE_API_URL;

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