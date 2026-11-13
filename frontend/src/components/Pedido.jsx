import { useState } from 'react'
import { crearPedido } from '../api.js'
import { img } from '../img.js'
import { MAX_CANTIDAD } from '../hooks/useCarrito.js'
import { formatearPrecio } from '../utils/precio.js'

const DATOS_INICIALES = {
  nombre: '',
  telefono: '',
  tipoEntrega: 'domicilio',
  direccion: '',
  notas: '',
}

function Pedido({ carrito }) {
  const { lineas, total, cambiarCantidad, quitar, vaciar } = carrito

  const [datos, setDatos] = useState(DATOS_INICIALES)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  // Se llena cuando el servidor acepta el pedido: { codigo, total, tipoEntrega }
  const [confirmacion, setConfirmacion] = useState(null)

  function manejarCambio(event) {
    const { name, value } = event.target
    setDatos((anterior) => ({ ...anterior, [name]: value }))
  }

  async function manejarEnvio(event) {
    event.preventDefault()
    if (enviando || lineas.length === 0) return

    setEnviando(true)
    setError('')

    try {
      // Solo enviamos id y cantidad: el precio y el total los calcula el servidor.
      const resultado = await crearPedido({
        ...datos,
        items: lineas.map(({ id, cantidad }) => ({ id, cantidad })),
      })

      setConfirmacion({
        codigo: resultado.codigo,
        total: resultado.total,
        tipoEntrega: datos.tipoEntrega,
      })
      vaciar()
      setDatos(DATOS_INICIALES)
    } catch (errorEnvio) {
      // Si un producto dejó de estar disponible lo sacamos del carrito.
      if (errorEnvio.noDisponibles?.length > 0) {
        errorEnvio.noDisponibles.forEach(quitar)
      }

      setError(
        errorEnvio.message === 'Failed to fetch'
          ? 'No pudimos conectar con el servidor. Inténtalo de nuevo en un momento.'
          : errorEnvio.message
      )
    } finally {
      setEnviando(false)
    }
  }

  // 1) Pedido enviado
  if (confirmacion) {
    return (
      <main className="pagina-pedido animate__animated animate__fadeInUp">
        <span className="pedido-icono" aria-hidden="true">✅</span>
        <h1>¡Recibimos tu pedido!</h1>
        <p role="status">
          Tu código es <strong className="pedido-codigo">{confirmacion.codigo}</strong>.
          Guárdalo por si necesitas preguntar por tu pedido.
        </p>
        <p>
          Total a pagar: <strong>{formatearPrecio(confirmacion.total)}</strong>.{' '}
          {confirmacion.tipoEntrega === 'domicilio'
            ? 'Pagas al recibirlo en tu dirección.'
            : 'Pagas al recogerlo en el local.'}{' '}
          Te contactaremos al teléfono que nos diste para confirmarlo.
        </p>
        <a className="boton-principal" href="#menu">
          Volver al menú <span aria-hidden="true">→</span>
        </a>
      </main>
    )
  }

  // 2) Carrito vacío
  if (lineas.length === 0) {
    return (
      <main className="pagina-pedido animate__animated animate__fadeInUp">
        <a className="volver-inicio" href="#inicio">← Volver a Bite&amp;Go</a>
        <span className="pedido-icono" aria-hidden="true">🛍️</span>
        <h1>Tu próximo antojo empieza aquí</h1>
        {error && <p className="pedido-error" role="alert">{error}</p>}
        <p>Aún no has agregado nada. Elige tus mini hamburguesas del menú y vuelve para confirmar tu pedido.</p>
        <a className="boton-principal" href="#menu">Explorar el menú <span aria-hidden="true">→</span></a>
      </main>
    )
  }

  // 3) Revisar el pedido y enviarlo
  const esDomicilio = datos.tipoEntrega === 'domicilio'

  return (
    <main className="pedido-pagina animate__animated animate__fadeIn">
      <a className="volver-inicio" href="#menu">← Seguir pidiendo</a>

      <h1>Tu pedido</h1>

      <div className="pedido-layout">
        <section className="pedido-resumen" aria-labelledby="titulo-resumen">
          <h2 id="titulo-resumen">Resumen</h2>

          <ul className="pedido-lineas">
            {lineas.map((linea) => (
              <li key={linea.id} className="pedido-linea">
                {linea.imagen && (
                  <img src={img(linea.imagen)} alt={linea.alt} loading="lazy" />
                )}

                <div className="pedido-linea-info">
                  <h3>{linea.nombre}</h3>
                  <p>{formatearPrecio(linea.precio)} c/u</p>

                  <div className="pedido-cantidad">
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(linea.id, -1)}
                      disabled={linea.cantidad <= 1}
                      aria-label={`Quitar una unidad de ${linea.nombre}`}
                    >
                      −
                    </button>
                    <span aria-live="polite" aria-label={`Cantidad: ${linea.cantidad}`}>
                      {linea.cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(linea.id, 1)}
                      disabled={linea.cantidad >= MAX_CANTIDAD}
                      aria-label={`Agregar una unidad de ${linea.nombre}`}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pedido-linea-precio">
                  <strong>{formatearPrecio(linea.precio * linea.cantidad)}</strong>
                  <button
                    type="button"
                    className="pedido-quitar"
                    onClick={() => quitar(linea.id)}
                    aria-label={`Quitar ${linea.nombre} del pedido`}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p className="pedido-total">
            Total <strong>{formatearPrecio(total)}</strong>
          </p>
          <p className="pedido-nota">El pago se hace al recibir o recoger tu pedido.</p>
        </section>

        <form className="pedido-formulario" onSubmit={manejarEnvio}>
          <h2>Tus datos</h2>

          <fieldset className="pedido-entrega">
            <legend>¿Cómo lo quieres?</legend>

            <label>
              <input
                type="radio"
                name="tipoEntrega"
                value="domicilio"
                checked={esDomicilio}
                onChange={manejarCambio}
              />
              <span>A domicilio</span>
            </label>

            <label>
              <input
                type="radio"
                name="tipoEntrega"
                value="recoger"
                checked={!esDomicilio}
                onChange={manejarCambio}
              />
              <span>Recoger en el local</span>
            </label>
          </fieldset>

          <div className="form-group">
            <label htmlFor="pedido-nombre">Nombre:</label>
            <input
              type="text"
              id="pedido-nombre"
              name="nombre"
              autoComplete="name"
              maxLength={100}
              required
              value={datos.nombre}
              onChange={manejarCambio}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pedido-telefono">Teléfono / WhatsApp:</label>
            <input
              type="tel"
              id="pedido-telefono"
              name="telefono"
              autoComplete="tel"
              inputMode="tel"
              minLength={7}
              maxLength={20}
              required
              value={datos.telefono}
              onChange={manejarCambio}
            />
          </div>

          {esDomicilio && (
            <div className="form-group">
              <label htmlFor="pedido-direccion">Dirección de entrega:</label>
              <input
                type="text"
                id="pedido-direccion"
                name="direccion"
                autoComplete="street-address"
                maxLength={200}
                required
                value={datos.direccion}
                onChange={manejarCambio}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="pedido-notas">Notas (opcional):</label>
            <textarea
              id="pedido-notas"
              name="notas"
              maxLength={300}
              placeholder="Sin cebolla, timbre dañado, etc."
              value={datos.notas}
              onChange={manejarCambio}
            ></textarea>
          </div>

          {error && <p className="pedido-error" role="alert">{error}</p>}

          <button type="submit" className="pedido-enviar" disabled={enviando}>
            {enviando ? 'Enviando...' : `Confirmar pedido · ${formatearPrecio(total)}`}
          </button>
        </form>
      </div>
    </main>
  )
}

export default Pedido
