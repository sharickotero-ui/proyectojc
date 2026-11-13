import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE se usa al publicar en GitHub Pages (ej: /proyectojc/).
// En desarrollo queda '/'.
export default defineConfig({
  base: process.env.VITE_BASE || '/proyectojc/',
  plugins: [react()],
})
