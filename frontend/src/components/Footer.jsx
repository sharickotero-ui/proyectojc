import { img } from '../img.js'

function Footer() {
  return (
    <footer>
      <section id="contenido-footer">
        <div className="footer-marca">
          <a href="#inicio">
            <img
              src={img('logocompleto.png')}
              alt="Logo de Bite&Go"
              className="footer-logo"
            />
          </a>
        </div>

        <div className="footer-links">
          <a href="#inicio">Inicio</a>
          <a href="#menu">Menú</a>
          <a href="#contacto">Contacto</a>
        </div>

        <div className="footer-social">
          <h3>Redes Sociales</h3>
          <a
            href="https://www.instagram.com/biteandgo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Bite&Go"
          >
            <img
              src={img('instagram-logo-instagram-icon-transparent-free-png.webp')}
              alt=""
              aria-hidden="true"
            />
          </a>
        </div>
      </section>

      <p>
        <small>© 2026 Bite&Go. Todos los derechos reservados.</small>
      </p>
    </footer>
  )
}

export default Footer
