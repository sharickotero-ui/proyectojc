import { img } from '../img.js'

function ProductoCard({ producto, style }) {
  const tituloId = `titulo-${producto.id}`

  return (
    <article aria-labelledby={tituloId} className="animate__animated animate__fadeInUp" style={style}>
      <img src={img(producto.imagen)} alt={producto.alt} loading="lazy" />

      <h3 id={tituloId}>{producto.nombre}</h3>

      <p>{producto.descripcion}</p>
      <span className="precio">{producto.precio}</span>
    </article>
  )
}

export default ProductoCard
