import { img } from '../img.js'

function ProductoCard({ producto }) {
  const tituloId = `titulo-${producto.id}`

  return (
    <article aria-labelledby={tituloId}>
      <img src={img(producto.imagen)} alt={producto.alt} loading="lazy" />

      <h3 id={tituloId}>{producto.nombre}</h3>

      <p>{producto.descripcion}</p>
      <span className="precio">{producto.precio}</span>
    </article>
  )
}

export default ProductoCard
