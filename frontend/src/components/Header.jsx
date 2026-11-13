import { img } from '../img.js'

function Header({ cantidadPedido = 0 }) {
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
          <a
            href="#pedido"
            aria-label={
              cantidadPedido > 0
                ? `Mi pedido, ${cantidadPedido} ${cantidadPedido === 1 ? 'producto' : 'productos'}`
                : 'Mi pedido'
            }
          >
            <span>
              Mi pedido
              {cantidadPedido > 0 && (
                <b className="pedido-contador" aria-hidden="true">{cantidadPedido}</b>
              )}
            </span>
          </a>
        </div>
      </nav>
    </header>
  )
}

export default Header
