import { useState } from 'react'
import { enviarContacto } from '../api.js'

const FORMULARIO_VACIO = { nombre: '', email: '', mensaje: '' }

function FormularioContacto() {
  // Lo que el usuario va escribiendo en cada campo
  const [datos, setDatos] = useState(FORMULARIO_VACIO)
  // true mientras la petición está en camino (deshabilita el botón)
  const [enviando, setEnviando] = useState(false)
  // Mensaje de éxito o error: { texto, tipo } donde tipo es 'ok' o 'error'
  const [estado, setEstado] = useState({ texto: '', tipo: '' })

  // Actualiza solo el campo que cambió, usando su atributo name
  const manejarCambio = (event) => {
    const { name, value } = event.target
    setDatos((anterior) => ({ ...anterior, [name]: value }))
  }

  // Envía el formulario a la API sin recargar la página
  const manejarEnvio = async (event) => {
    event.preventDefault()
    setEnviando(true)
    setEstado({ texto: '', tipo: '' })

    try {
      await enviarContacto(datos)
      setEstado({
        texto: '¡Mensaje enviado! Te responderemos pronto.',
        tipo: 'ok',
      })
      setDatos(FORMULARIO_VACIO)
    } catch (error) {
      // Si el servidor no responde, fetch lanza "Failed to fetch".
      setEstado({
        texto:
          error.message === 'Failed to fetch'
            ? 'No pudimos conectar con el servidor. Inténtalo de nuevo en un momento.'
            : error.message,
        tipo: 'error',
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section
      id="formulario-contacto"
      aria-labelledby="titulo-formulario-contacto"
    >
      <h2 id="titulo-formulario-contacto">Escríbenos</h2>

      <form id="contact-form" onSubmit={manejarEnvio}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            autoComplete="name"
            maxLength={100}
            required
            value={datos.nombre}
            onChange={manejarCambio}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            required
            value={datos.email}
            onChange={manejarCambio}
          />
        </div>

        <div className="form-group">
          <label htmlFor="mensaje">Mensaje:</label>
          <textarea
            id="mensaje"
            name="mensaje"
            maxLength={1000}
            required
            value={datos.mensaje}
            onChange={manejarCambio}
          ></textarea>
        </div>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar'}
        </button>
        <p id="form-status" className={estado.tipo} role="status" aria-live="polite">
          {estado.texto}
        </p>
      </form>
    </section>
  )
}

export default FormularioContacto
