// Cambia esta URL por la de Render cuando despliegues el backend.
const API_URL = 'http://localhost:3000';

const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

// Envía el formulario a la API sin recargar la página y muestra
// estado de carga, éxito o error para que el usuario sepa qué pasó.
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Enviando...';
  status.textContent = '';
  status.className = '';

  // Convierte los campos del formulario en un objeto {nombre, email, mensaje}.
  const datos = Object.fromEntries(new FormData(form));

  try {
    const response = await fetch(`${API_URL}/api/contacto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    const resultado = await response.json();

    if (!response.ok) throw new Error(resultado.error || 'Error desconocido');

    status.textContent = '¡Mensaje enviado! Te responderemos pronto.';
    status.className = 'ok';
    form.reset();
  } catch (error) {
    // Si el servidor no responde, fetch lanza "Failed to fetch".
    status.textContent = error.message === 'Failed to fetch'
      ? 'No pudimos conectar con el servidor. Inténtalo de nuevo en un momento.'
      : error.message;
    status.className = 'error';
  } finally {
    button.disabled = false;
    button.textContent = 'Enviar';
  }
});