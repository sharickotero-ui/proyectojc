
import { useEffect, useState } from 'react'

import Header from './components/Header.jsx'
import Inicio from './components/Inicio.jsx'
import Menu from './components/Menu.jsx'
import Contacto from './components/Contacto.jsx'
import FormularioContacto from './components/FormularioContacto.jsx'
import Footer from './components/Footer.jsx'

import LoginAdmin from './components/LoginAdmin.jsx'
import AdminPanel from './components/AdminPanel.jsx'

function App() {
  const [ruta, setRuta] = useState(window.location.hash)

  useEffect(() => {
    function cambiarRuta() {
      setRuta(window.location.hash)
    }

    window.addEventListener('hashchange', cambiarRuta)

    return () => {
      window.removeEventListener('hashchange', cambiarRuta)
    }
  }, [])

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

  return (
    <>
      <Header />
      <main>
        <Inicio />
        <Menu />
        <Contacto />
        <FormularioContacto />
      </main>
      <Footer />
    </>
  )
}

export default App
