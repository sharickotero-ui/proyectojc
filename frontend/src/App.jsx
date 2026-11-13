import Header from './components/Header.jsx'
import Inicio from './components/Inicio.jsx'
import Menu from './components/Menu.jsx'
import Contacto from './components/Contacto.jsx'
import FormularioContacto from './components/FormularioContacto.jsx'
import Footer from './components/Footer.jsx'

function App() {
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
