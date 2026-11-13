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
        <a href="#contacto">Contacto</a>

        <div>
          <a href="#formulario-contacto" className="boton-contacto">
            ¡Contactar Ahora!
          </a>
        </div>

        {/* login.html estaba vacío; el enlace queda listo para cuando exista el login */}
        <div className="perfil">
          <a href="#inicio">
            <img src={img('icono-perfil.png')} alt="" aria-hidden="true" />
            <span>Mi perfil</span>
          </a>
        </div>
      </nav>
    </header>
  )
}

export default Header
