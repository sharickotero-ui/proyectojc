import { useEffect, useRef, useState } from 'react'
import { enviarMensajeChat } from '../api.js'

// Primer mensaje que ve el cliente al abrir el chat.
// No se envía a Gemini, solo se muestra.
const SALUDO = {
  rol: 'bot',
  texto: '¡Hola! Soy Biti 🍔 ¿Te ayudo a escoger tu mini hamburguesa?',
}

function Chatbot() {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([SALUDO])
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  // Marca el final de la conversación para bajar el scroll solo
  const finRef = useRef(null)

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando, abierto])

  async function manejarEnvio(e) {
    e.preventDefault()
    const pregunta = texto.trim()
    if (!pregunta || cargando) return

    // Lo que se habló antes de esta pregunta (sin el saludo)
    const historial = mensajes.slice(1)

    setMensajes((anteriores) => [...anteriores, { rol: 'usuario', texto: pregunta }])
    setTexto('')
    setError('')
    setCargando(true)

    try {
      const { respuesta } = await enviarMensajeChat(pregunta, historial)
      setMensajes((anteriores) => [...anteriores, { rol: 'bot', texto: respuesta }])
    } catch (err) {
      // Si falla, quitamos la pregunta y la devolvemos al campo para reintentar
      setMensajes((anteriores) => anteriores.slice(0, -1))
      setTexto(pregunta)
      setError(
        err.message === 'Failed to fetch'
          ? 'No pudimos conectar con Biti. Inténtalo de nuevo en un momento.'
          : err.message
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="chatbot">
      {abierto && (
        <div
          className="chatbot-ventana animate__animated animate__fadeInUp"
          role="dialog"
          aria-label="Chat con Biti, asistente de Bite&Go"
        >
          <div className="chatbot-encabezado">
            <div>
              <strong>Biti</strong>
              <small>Asistente de Bite&Go</small>
            </div>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar chat">
              ✕
            </button>
          </div>

          <div className="chatbot-mensajes" aria-live="polite">
            {mensajes.map((mensaje, index) => (
              <p key={index} className={`chatbot-burbuja ${mensaje.rol}`}>
                {mensaje.texto}
              </p>
            ))}

            {cargando && (
              <p className="chatbot-burbuja bot escribiendo">Biti está escribiendo…</p>
            )}

            {error && (
              <p className="chatbot-error" role="alert">
                {error}
              </p>
            )}

            <div ref={finRef} />
          </div>

          <form className="chatbot-formulario" onSubmit={manejarEnvio}>
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe tu pregunta..."
              maxLength={500}
              aria-label="Tu mensaje para Biti"
              disabled={cargando}
            />
            <button type="submit" disabled={cargando || !texto.trim()}>
              Enviar
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chatbot-boton"
        onClick={() => setAbierto((estaAbierto) => !estaAbierto)}
        aria-expanded={abierto}
        aria-label={abierto ? 'Cerrar chat con Biti' : 'Abrir chat con Biti'}
      >
        {abierto ? '✕' : '💬'}
      </button>
    </div>
  )
}

export default Chatbot