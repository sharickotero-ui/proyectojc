
import { useEffect, useState } from 'react'

import { useCarrito } from './hooks/useCarrito.js'

import Header from './components/Header.jsx'
import Inicio from './components/Inicio.jsx'
import Menu from './components/Menu.jsx'
import Contacto from './components/Contacto.jsx'
import FormularioContacto from './components/FormularioContacto.jsx'
import Footer from './components/Footer.jsx'

import Pedido from './components/Pedido.jsx'

import LoginAdmin from './components/LoginAdmin.jsx'
import AdminPanel from './components/AdminPanel.jsx'

function App() {
  const [ruta, setRuta] = useState(window.location.hash)
  // El carrito vive aquí para que sobreviva al cambio entre el menú y #pedido
  const carrito = useCarrito()

  useEffect(() => {
    function cambiarRuta() {
      setRuta(window.location.hash)
    }

    window.addEventListener('hashchange', cambiarRuta)

    return () => {
      window.removeEventListener('hashchange', cambiarRuta)
    }
  }, [])

  // Al cambiar de pantalla el contenido se vuelve a dibujar, así que el
  // navegador no alcanza a saltar solo al ancla (#menu): lo hacemos aquí.
  useEffect(() => {
    if (ruta === '#pedido') {
      window.scrollTo({ top: 0 })
      return
    }

    const id = ruta.replace('#', '')
    if (!id || id === 'admin' || id === 'admin-panel') return

    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView()
    })
  }, [ruta])

  if (ruta === '#admin') {
    return <LoginAdmin />
  }

  if (ruta === '#admin-panel') {
    const token = sessionStorage.getItem('adminToken')

    if (!token) {
      window.location.hash = 'admin'
      return <LoginAdmin />
    }

    return <AdminPanel />
  }

  if (ruta === '#pedido') {
    return <Pedido carrito={carrito} />
  }

  return (
    <>
      <Header cantidadPedido={carrito.cantidadTotal} />

      <main>
        <Inicio />
        <Menu onAgregar={carrito.agregar} />

        <div className="contacto-contenedor">
          <Contacto />
          <FormularioContacto />
        </div>
      </main>

      <Footer />
    </>
  )
}

export default App
