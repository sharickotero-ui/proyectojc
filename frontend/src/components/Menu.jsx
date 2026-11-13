import { useEffect, useState } from 'react'
import ProductoCard from './ProductoCard.jsx'
import { obtenerProductos } from '../api.js'

function Menu() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarProductos() {
      try {
        const datos = await obtenerProductos()
        setProductos(datos)
      } catch (error) {
        console.error('Error cargando productos:', error)
        setError('No fue posible cargar nuestro menú.')
      } finally {
        setCargando(false)
      }
    }

    cargarProductos()
  }, [])

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
        {cargando && <p>Cargando nuestro menú...</p>}

        {error && <p>{error}</p>}

        {!cargando && !error && productos.length === 0 && (
          <p>Por el momento no hay productos disponibles.</p>
        )}

        {!cargando && !error && productos.map((producto) => (
          <ProductoCard
            key={producto._id || producto.id}
            producto={producto}
          />
        ))}
      </div>
    </section>
  )
}

export default Menu