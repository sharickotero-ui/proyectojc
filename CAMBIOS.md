# Cambios realizados en Bite&Go

- Se mantuvo la estructura React + Vite y las rutas existentes del backend Express.
- Se conservó la configuración de API, CORS, JWT, MongoDB Atlas, Render y GitHub Pages.
- Se añadió Animate.css 4.1.1 desde CDN y animaciones de entrada para portada, catálogo, contacto y administración.
- Se completaron estilos del inicio de sesión, panel administrativo y pantalla de pedido.
- Se mejoraron estados hover/focus, tarjetas, formularios, responsive y soporte para `prefers-reduced-motion`.
- El catálogo usa los productos de MongoDB cuando están disponibles y muestra el catálogo local como respaldo cuando la colección está vacía o la API no responde.
- Se añadió la opción de activar/desactivar productos desde administración, además de crear, editar y eliminar.
- Se añadió acceso al inicio de sesión administrativo desde el pie de página y navegación de regreso.
- Se corrigió la ruta del favicon para que respete el `BASE_URL` de GitHub Pages.
- Se completó `backend/.env.example` con las variables obligatorias del servidor.

## Pedidos

- Se añadió el flujo completo de pedidos: carrito, pantalla `#pedido`, `POST /api/pedidos`, modelo `Order` en MongoDB y gestión de estados desde administración.
- El total se calcula en el servidor con los precios del catálogo; lo que envía el navegador solo se usa para saber qué productos y cuántas unidades.
- Se añadió `app.set('trust proxy', 1)` para que los límites de peticiones (login y pedidos) cuenten por visitante real y no por la IP del proxy de Render.
- Si MongoDB no tiene productos, los pedidos se aceptan contra el catálogo base (igual que el menú), definido en `backend/src/pedidos.js`.

## Seguridad

El archivo real `backend/.env` no se incluye en este paquete. Crea uno a partir de `backend/.env.example` y completa tus credenciales privadas. No publiques `MONGO_URI`, `ADMIN_PASSWORD_HASH` ni `JWT_SECRET`.
