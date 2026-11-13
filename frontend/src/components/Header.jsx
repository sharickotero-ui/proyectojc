import { img } from '../img.js'

function Header() {
  return (
    <header>
      <div className="logo">
        <a href="#inicio">
          <img src={img('logocompleto.png')} alt="Bite&Go" />
        </a>
      </div>

      <nav aria-label="Navegación principal">
        <a href="#inicio">Inicio</a>
        <a href="#menu">Menú</a>

        <div>
          <a href="#formulario-contacto" className="boton-contacto">
            ¡Contactar Ahora!
          </a>
        </div>

        <div className="pedido">
          <a href="#pedido">
            <span>Mi pedido</span>
          </a>
        </div>
      </nav>
    </header>
  )
}

export default Header
