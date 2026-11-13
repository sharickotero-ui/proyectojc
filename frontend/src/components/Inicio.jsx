import { img } from '../img.js'

function Inicio() {
  return (
    <section id="inicio" aria-labelledby="titulo-inicio-principal">
      <div className="inicio-texto animate__animated animate__fadeInLeft">
        <h1>
          Bienvenido a <strong>Bite</strong>
          <b>{'&'}</b>
          <b>Go</b>
        </h1>
        <h2 id="titulo-inicio-principal">Mini hamburguesas, máxima comodidad</h2>

        <p>Disfruta sin parar: abre, come y continúa...</p>

        <a className="boton-principal" href="#menu">Ver el menú <span aria-hidden="true">→</span></a>
      </div>

      <div className="foto animate__animated animate__fadeIn">
        <img src={img('producto.jpeg')} alt="Mini hamburguesas de Bite&Go" />
      </div>
    </section>
  )
}

export default Inicio
