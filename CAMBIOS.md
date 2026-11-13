# Qué cambió en la migración a React y por qué

La página se ve y funciona igual que antes. Cambió **cómo está construida**.

## Estructura

| Antes | Ahora | Por qué |
|---|---|---|
| `index.html` con todo el HTML | `frontend/src/components/*.jsx` | Cada parte de la página es una pieza reutilizable (componente) |
| `frontend/dinamica/dinamica.js` | `frontend/src/components/FormularioContacto.jsx` + `frontend/src/api.js` | El formulario usa `useState` y el `fetch` vive en un solo archivo |
| `frontend/styles/sts.css` | `frontend/src/styles/sts.css` | **Sin cambios**: mismos colores, fuentes y clases |
| `frontend/imagenes/` | `frontend/public/img/` | Vite sirve desde `public/` lo que no se importa |
| `backend/server.js` | `backend/src/server.js` | **Sin cambios de código**; solo cambió de carpeta |

## Componentes

| Componente | Sale de… | ¿Tiene estado? |
|---|---|---|
| `Header` | `<header>` con logo y navegación | No |
| `Inicio` | `<section id="inicio">` | No |
| `Menu` + `ProductoCard` | `<section id="menu">` y cada `<article>` | No: las tarjetas salen de `.map()` sobre `data/productos.js` |
| `Contacto` | `<section id="contacto">` | No |
| `FormularioContacto` | formulario + `dinamica.js` | Sí: `useState` para los campos, el botón "Enviando..." y el mensaje de éxito o error |
| `Footer` | `<footer>` | No |

## De vanilla a React (el formulario)

| Antes (vanilla) | Ahora (React) |
|---|---|
| `document.getElementById(...)` | `useState` guarda lo que escribe el usuario |
| `new FormData(form)` | el objeto `datos` del estado |
| `button.disabled = true` / `button.textContent = ...` | `disabled={enviando}` y `{enviando ? 'Enviando...' : 'Enviar'}` |
| `status.textContent` / `status.className` | estado `{ texto, tipo }` mostrado en el `<p id="form-status">` |
| `form.addEventListener('submit', ...)` | `onSubmit={manejarEnvio}` |
| `class`, `for`, `maxlength`, `autocomplete` | `className`, `htmlFor`, `maxLength`, `autoComplete` |

## Cosas a tener en cuenta

1. **`login.html` estaba vacío.** El botón "Mi perfil" ahora lleva al inicio de la página hasta que exista el login (eso necesitaría React Router, que se ve más adelante).
2. **Imágenes que no se usaban** y no se copiaron: `hamburuesas.png` (2,4 MB), `logo.jpeg`, `logocompleto.jpeg` y `refe.jpeg`. Siguen en tu versión anterior por si las necesitas.
3. **Datos del menú:** el backend aún no tiene `/api/productos`, así que el menú sale de `src/data/productos.js`. Cuando exista la ruta, ese archivo se reemplaza por un `fetch` en `api.js`.
4. **CORS:** `FRONTEND_URL` en `backend/.env` y en Render debe incluir el origen del frontend: `http://localhost:5173` para desarrollo y `https://sharickotero-ui.github.io` para GitHub Pages (sin `/proyectojc`).
5. **El CSS depende del orden** de `<strong>`, `<b>`, `<b>` dentro del `<h1>` de Inicio (`#inicio b:nth-child(3)`). Si cambias ese título, revisa los colores.
6. En el CSS hay dos reglas `footer > p` repetidas; la última gana. No se tocó para no cambiar el diseño.
7. `server.js` separa `FRONTEND_URL` por comas **sin quitar espacios**: escríbela sin espacios después de la coma.
