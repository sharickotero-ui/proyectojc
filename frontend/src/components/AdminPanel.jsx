import { useEffect, useState } from "react";

import {
  obtenerProductosAdmin,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerMensajesAdmin,
} from "../api.js";

const formularioInicial = {
  id: "",
  nombre: "",
  descripcion: "",
  precio: "",
  imagen: "",
  alt: "",
};

function AdminPanel() {
  const [productos, setProductos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [productoEditando, setProductoEditando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [errorMensajes, setErrorMensajes] = useState("");

  async function cargarProductos() {
    try {
      setError("");
      const datos = await obtenerProductosAdmin();
      setProductos(datos);
    } catch (error) {
      setError(error.message);
    } finally {
      setCargando(false);
    }
  }

  async function cargarMensajes() {
    setCargandoMensajes(true);
    setErrorMensajes("");

    try {
      const datos = await obtenerMensajesAdmin();
      setMensajes(datos);
    } catch (error) {
      setErrorMensajes(error.message);
    } finally {
      setCargandoMensajes(false);
    }
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  function manejarCambio(e) {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setGuardando(true);

    try {
      if (productoEditando) {
        await actualizarProducto(productoEditando, {
          nombre: formulario.nombre,
          descripcion: formulario.descripcion,
          precio: formulario.precio,
          imagen: formulario.imagen,
          alt: formulario.alt,
        });

        setMensaje("Producto actualizado correctamente.");
      } else {
        await crearProducto(formulario);
        setMensaje("Producto creado correctamente.");
      }

      setFormulario(formularioInicial);
      setProductoEditando(null);
      await cargarProductos();
    } catch (error) {
      setError(error.message);
    } finally {
      setGuardando(false);
    }
  }

  function prepararEdicion(producto) {
    setProductoEditando(producto.id);

    setFormulario({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      imagen: producto.imagen,
      alt: producto.alt,
    });

    setMensaje("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicion() {
    setProductoEditando(null);
    setFormulario(formularioInicial);
    setError("");
    setMensaje("");
  }

  async function manejarEliminacion(id, nombre) {
    const confirmar = window.confirm(
      `¿Estás segura de que deseas eliminar "${nombre}"?`,
    );

    if (!confirmar) return;

    setError("");
    setMensaje("");

    try {
      await eliminarProducto(id);
      setMensaje("Producto eliminado correctamente.");
      await cargarProductos();
    } catch (error) {
      setError(error.message);
    }
  }

  function cerrarSesion() {
    sessionStorage.removeItem("adminToken");
    window.location.hash = "admin";
  }

  return (
    <main className="admin-panel">
      <header className="admin-header">
        <h1>Administración Bite&Go</h1>
        <button type="button" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </header>

      <section className="admin-formulario">
        <h2>{productoEditando ? "Editar producto" : "Agregar producto"}</h2>

        <form onSubmit={manejarEnvio}>
          <label htmlFor="id">Identificador</label>
          <input
            id="id"
            name="id"
            value={formulario.id}
            onChange={manejarCambio}
            placeholder="Ejemplo: clasica"
            required
            disabled={Boolean(productoEditando)}
          />

          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            value={formulario.nombre}
            onChange={manejarCambio}
            placeholder="Nombre de la hamburguesa"
            maxLength="100"
            required
          />

          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formulario.descripcion}
            onChange={manejarCambio}
            placeholder="Ingredientes y descripción"
            maxLength="500"
            required
          />

          <label htmlFor="precio">Precio</label>
          <input
            id="precio"
            name="precio"
            value={formulario.precio}
            onChange={manejarCambio}
            placeholder="$12.000"
            required
          />

          <label htmlFor="imagen">Nombre de la imagen</label>
          <input
            id="imagen"
            name="imagen"
            value={formulario.imagen}
            onChange={manejarCambio}
            placeholder="Ejemplo: clasica.png"
            required
          />

          <label htmlFor="alt">Texto alternativo de la imagen</label>
          <input
            id="alt"
            name="alt"
            value={formulario.alt}
            onChange={manejarCambio}
            placeholder="Descripción de la imagen"
            required
          />

          {error && <p role="alert">{error}</p>}
          {mensaje && <p role="status">{mensaje}</p>}

          <button type="submit" disabled={guardando}>
            {guardando
              ? "Guardando..."
              : productoEditando
                ? "Guardar cambios"
                : "Agregar producto"}
          </button>

          {productoEditando && (
            <button type="button" onClick={cancelarEdicion}>
              Cancelar edición
            </button>
          )}
        </form>
      </section>

      <section className="admin-productos">
        <h2>Productos registrados</h2>

        {cargando && <p>Cargando productos...</p>}

        {!cargando && productos.length === 0 && (
          <p>No hay productos registrados.</p>
        )}

        <div className="admin-lista">
          {productos.map((producto) => (
            <article key={producto._id} className="admin-producto">
              <h3>{producto.nombre}</h3>
              <p>{producto.descripcion}</p>
              <p>Precio: {producto.precio}</p>
              <p>Identificador: {producto.id}</p>
              <p>
                Estado: {producto.disponible ? "Disponible" : "No disponible"}
              </p>

              <button type="button" onClick={() => prepararEdicion(producto)}>
                Editar
              </button>

              <button
                type="button"
                onClick={() => manejarEliminacion(producto.id, producto.nombre)}
              >
                Eliminar
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-mensajes">
        <h2>Mensajes de contacto</h2>

        <button
          type="button"
          onClick={cargarMensajes}
          disabled={cargandoMensajes}
        >
          {cargandoMensajes ? "Consultando..." : "Consultar mensajes"}
        </button>

        {errorMensajes && <p role="alert">{errorMensajes}</p>}

        {!cargandoMensajes && mensajes.length === 0 && (
          <p>No hay mensajes para mostrar.</p>
        )}

        <div className="lista-mensajes">
          {mensajes.map((mensaje) => (
            <article key={mensaje._id} className="mensaje-card">
              <h3>{mensaje.nombre}</h3>

              <p>
                <strong>Correo:</strong> {mensaje.email}
              </p>

              <p>
                <strong>Mensaje:</strong> {mensaje.mensaje}
              </p>

              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(mensaje.fecha).toLocaleString("es-CO")}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default AdminPanel;
