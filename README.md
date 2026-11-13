# Bite&Go — mini hamburguesas

Página de pedidos de Bite&Go. Frontend en **React 19 + Vite** y API en **Express + MongoDB Atlas**.

```
proyectojc/
├── backend/            API (Express + Mongoose)
│   └── src/server.js
├── frontend/           Página hecha con componentes de React
│   └── src/App.jsx
├── README.md
└── CAMBIOS.md          Qué cambió en la migración y por qué
```

## Cómo correrlo en tu computador

Necesitas Node 22 o más reciente. Abre **dos terminales**:

**Terminal 1 · backend**
```bash
cd backend
npm install
cp .env.example .env      # completa todas las variables requeridas
npm run dev
```

**Terminal 2 · frontend**
```bash
cd frontend
pnpm install
pnpm run dev
```

Abre http://localhost:5173. El frontend consume la API configurada en `VITE_API_URL`. Si quieres trabajar contra tu backend local, configura esa variable como `http://localhost:3000`. Si MongoDB aún no tiene productos, el catálogo muestra los productos locales de respaldo.

## Animaciones

La interfaz utiliza [Animate.css 4.1.1](https://animate.style/) desde CDN para animaciones de entrada y microinteracciones. No cambia las rutas ni la lógica de la API.

## Variables de entorno

| Dónde | Variable | Para qué |
|---|---|---|
| `backend/.env` | `PORT` | Puerto de la API (3000) |
| `backend/.env` | `MONGO_URI` | Conexión a MongoDB Atlas (**secreta**, no se sube a GitHub) |
| `backend/.env` | `FRONTEND_URL` | Orígenes permitidos por CORS, separados por coma |
| `backend/.env` | `ADMIN_EMAIL` | Correo de acceso al panel de administración |
| `backend/.env` | `ADMIN_PASSWORD_HASH` | Hash bcrypt de la contraseña administrativa |
| `backend/.env` | `JWT_SECRET` | Secreto privado para firmar los tokens JWT |
| `frontend/.env.development` | `VITE_API_URL` | URL de la API en desarrollo |
| `frontend/.env.production` | `VITE_API_URL` | API en Render |

## Comprobar antes de entregar
```bash
cd frontend
pnpm run lint
pnpm run build
```

## Publicación
- **API:** Render, con *Root Directory* = `backend`, *Build Command* = `npm install` y *Start Command* = `npm start`.
- **Frontend:** GitHub Pages con la rama `gh-pages`. Desde la carpeta `frontend`:
  `pnpm run deploy` (construye y publica `dist`).
  En Settings → Pages: Source = Deploy from a branch → `gh-pages`.