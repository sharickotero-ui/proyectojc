import ProductoCard from './ProductoCard.jsx'
import { productos } from '../data/productos.js'

function Menu() {
  return (
    <section id="menu" aria-labelledby="titulo-menu">
      <div>
        <h2 id="titulo-menu">Nuestro menú</h2>
        <b>¿Cuál se te antoja? </b>
        <p>
          Nuestro menú incluye una variedad de mini hamburguesas para todos los
          gustos.
        </p>
      </div>

      <div className="menu-grid">
        {productos.map((producto) => (
          <ProductoCard key={producto.id} producto={producto} />
        ))}
      </div>
    </section>
  )
}

export default Menu
