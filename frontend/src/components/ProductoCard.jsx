import { useEffect, useRef, useState } from 'react'
import { img } from '../img.js'

function ProductoCard({ producto, style, onAgregar }) {
  const tituloId = `titulo-${producto.id}`
  // true durante un instante después de agregar, para dar respuesta visual
  const [agregado, setAgregado] = useState(false)
  const temporizador = useRef(null)

  useEffect(() => () => clearTimeout(temporizador.current), [])

  function manejarAgregar() {
    onAgregar(producto)
    setAgregado(true)
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setAgregado(false), 1200)
  }

  return (
    <article aria-labelledby={tituloId} className="animate__animated animate__fadeInUp" style={style}>
      <img src={img(producto.imagen)} alt={producto.alt} loading="lazy" />

      <h3 id={tituloId}>{producto.nombre}</h3>

      <p>{producto.descripcion}</p>

      <div className="producto-acciones">
        <span className="precio">{producto.precio}</span>

        <button
          type="button"
          className={`boton-agregar${agregado ? ' agregado' : ''}`}
          onClick={manejarAgregar}
          aria-label={`Agregar ${producto.nombre} al pedido`}
        >
          {agregado ? 'Agregado ✓' : 'Agregar'}
        </button>
      </div>
    </article>
  )
}

export default ProductoCard
