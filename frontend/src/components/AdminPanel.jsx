import { useEffect, useState } from "react";

import {
  obtenerProductosAdmin,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerMensajesAdmin,
  obtenerPedidosAdmin,
  actualizarEstadoPedido,
} from "../api.js";

const ESTADOS_PEDIDO = [
  { valor: "pendiente", etiqueta: "Pendiente" },
  { valor: "confirmado", etiqueta: "Confirmado" },
  { valor: "preparando", etiqueta: "Preparando" },
  { valor: "entregado", etiqueta: "Entregado" },
  { valor: "cancelado", etiqueta: "Cancelado" },
];

const formatoPesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

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
  const [pedidos, setPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [errorPedidos, setErrorPedidos] = useState("");

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

  async function cargarPedidos() {
    setCargandoPedidos(true);
    setErrorPedidos("");

    try {
      const datos = await obtenerPedidosAdmin();
      setPedidos(datos);
    } catch (error) {
      setErrorPedidos(error.message);
    } finally {
      setCargandoPedidos(false);
    }
  }

  async function cambiarEstadoPedido(id, estado) {
    setErrorPedidos("");

    try {
      const actualizado = await actualizarEstadoPedido(id, estado);

      setPedidos((actuales) =>
        actuales.map((pedido) => (pedido._id === id ? actualizado : pedido)),
      );
    } catch (error) {
      setErrorPedidos(error.message);
    }
  }

  useEffect(() => {
    cargarProductos();
    cargarPedidos();
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
    <main className="admin-panel animate__animated animate__fadeIn">
      <header className="admin-header">
        <div>
          <h1>Administración Bite&Go</h1>
          <a className="admin-volver" href="#inicio">Volver a la página</a>
        </div>
        <button type="button" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </header>

      <section className="admin-pedidos" aria-labelledby="titulo-admin-pedidos">
        <h2 id="titulo-admin-pedidos">Pedidos</h2>

        <button
          type="button"
          onClick={cargarPedidos}
          disabled={cargandoPedidos}
        >
          {cargandoPedidos ? "Actualizando..." : "Actualizar pedidos"}
        </button>

        {errorPedidos && <p role="alert">{errorPedidos}</p>}

        {!cargandoPedidos && !errorPedidos && pedidos.length === 0 && (
          <p>Aún no hay pedidos.</p>
        )}

        <div className="admin-lista admin-lista-pedidos">
          {pedidos.map((pedido) => (
            <article
              key={pedido._id}
              className={`admin-producto pedido-admin estado-${pedido.estado}`}
            >
              <h3>{pedido.codigo}</h3>

              <p>
                <strong>Cliente:</strong> {pedido.cliente.nombre} ·{" "}
                <a href={`tel:${pedido.cliente.telefono}`}>
                  {pedido.cliente.telefono}
                </a>
              </p>

              <p>
                <strong>Entrega:</strong>{" "}
                {pedido.tipoEntrega === "domicilio"
                  ? `Domicilio · ${pedido.direccion}`
                  : "Recoge en el local"}
              </p>

              {pedido.notas && (
                <p>
                  <strong>Notas:</strong> {pedido.notas}
                </p>
              )}

              <ul className="pedido-admin-items">
                {pedido.items.map((item) => (
                  <li key={item.productoId}>
                    {item.cantidad} × {item.nombre} ·{" "}
                    {formatoPesos.format(item.precioUnitario * item.cantidad)}
                  </li>
                ))}
              </ul>

              <p>
                <strong>Total:</strong> {formatoPesos.format(pedido.total)}
              </p>

              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(pedido.createdAt).toLocaleString("es-CO")}
              </p>

              <label htmlFor={`estado-${pedido._id}`}>Estado</label>
              <select
                id={`estado-${pedido._id}`}
                value={pedido.estado}
                onChange={(e) => cambiarEstadoPedido(pedido._id, e.target.value)}
              >
                {ESTADOS_PEDIDO.map(({ valor, etiqueta }) => (
                  <option key={valor} value={valor}>
                    {etiqueta}
                  </option>
                ))}
              </select>
            </article>
          ))}
        </div>
      </section>

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
            <article key={producto._id || producto.id} className="admin-producto">
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
                className="boton-secundario"
                onClick={async () => {
                  try {
                    await actualizarProducto(producto.id, { disponible: !producto.disponible });
                    setMensaje(`Producto ${producto.disponible ? "desactivado" : "activado"} correctamente.`);
                    await cargarProductos();
                  } catch (error) {
                    setError(error.message);
                  }
                }}
              >
                {producto.disponible ? "Desactivar" : "Activar"}
              </button>

              <button
                type="button"
                className="boton-eliminar"
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
