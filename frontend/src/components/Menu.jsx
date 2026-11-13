import { useEffect, useState } from 'react'
import ProductoCard from './ProductoCard.jsx'
import { obtenerProductos } from '../api.js'
import { productos as productosLocales } from '../data/productos.js'

function Menu({ onAgregar }) {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarProductos() {
      try {
        const datos = await obtenerProductos()
        // Si la colección de MongoDB aún está vacía, mostramos el catálogo base.
        setProductos(Array.isArray(datos) && datos.length > 0 ? datos : productosLocales)
      } catch (error) {
        console.error('Error cargando productos:', error)
        // El catálogo local mantiene visible la página si la API no está disponible.
        setProductos(productosLocales)
      } finally {
        setCargando(false)
      }
    }

    cargarProductos()
  }, [])

  return (
    <section id="menu" aria-labelledby="titulo-menu">
      <div>
        <h2 id="titulo-menu" className="animate__animated animate__fadeInUp">Nuestro menú</h2>
        <b>¿Cuál se te antoja? </b>
        <p>
          Nuestro menú incluye una variedad de mini hamburguesas para todos los
          gustos.
        </p>
      </div>

      <div className="menu-grid">
        {cargando && <p>Cargando nuestro menú...</p>}

        {!cargando && productos.length === 0 && (
          <p>Por el momento no hay productos disponibles.</p>
        )}

        {!cargando && productos.map((producto, index) => (
          <ProductoCard
            key={producto._id || producto.id}
            producto={producto}
            onAgregar={onAgregar}
            style={{ animationDelay: `${index * 120}ms` }}
          />
        ))}
      </div>
    </section>
  )
}

export default Menu