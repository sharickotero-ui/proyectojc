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
cp .env.example .env      # luego abre .env y pega tu MONGO_URI de Atlas
npm run dev
```

**Terminal 2 · frontend**
```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173. El formulario de contacto envía a http://localhost:3000.

## Variables de entorno

| Dónde | Variable | Para qué |
|---|---|---|
| `backend/.env` | `PORT` | Puerto de la API (3000) |
| `backend/.env` | `MONGO_URI` | Conexión a MongoDB Atlas (**secreta**, no se sube a GitHub) |
| `backend/.env` | `FRONTEND_URL` | Orígenes permitidos por CORS, separados por coma |
| `frontend/.env.development` | `VITE_API_URL` | API local |
| `frontend/.env.production` | `VITE_API_URL` | API en Render |

## Comprobar antes de entregar
```bash
cd frontend
npm run lint
npm run build
```

## Publicación
- **API:** Render, con *Root Directory* = `backend`, *Build Command* = `npm install` y *Start Command* = `npm start`.
- **Frontend:** GitHub Pages con el workflow de `.github/workflows/deploy.yml` (Settings → Pages → Source: GitHub Actions).
