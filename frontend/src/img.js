// Devuelve la ruta de una imagen de public/img respetando la base de Vite
// (necesario para que funcione en GitHub Pages: /nombre-repo/img/...).
export const img = (nombre) => `${import.meta.env.BASE_URL}img/${nombre}`
