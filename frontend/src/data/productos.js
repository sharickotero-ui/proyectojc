// Datos del menú. El backend todavía no tiene la ruta /api/productos,
// así que por ahora viven aquí. Cuando exista, se cambian por un fetch en api.js.
export const productos = [
  {
    id: 'clasica',
    nombre: 'Mini clásica',
    descripcion:
      'Carne de res, queso cheddar, lechuga fresca, tomate, cebolla caramelizada, pepinillos y salsa de la casa.',
    precio: '$12.000',
    imagen: 'clasica.png',
    alt: 'Mini hamburguesa clásica con queso, vegetales y pepinillos',
  },
  {
    id: 'bacon',
    nombre: 'Mini bacon crunch',
    descripcion:
      'Carne de res, queso cheddar, tocineta crujiente, lechuga fresca, tomate y salsa miel-mostaza.',
    precio: '$12.000',
    imagen: 'bacon.png',
    alt: 'Mini hamburguesa con queso cheddar y tocineta crujiente',
  },
  {
    id: 'doble-queso',
    nombre: 'Mini double cheese',
    descripcion:
      'Carne de res, queso cheddar, queso mozzarella, lechuga fresca, tomate y salsa de la casa.',
    precio: '$14.000',
    imagen: 'doble.png',
    alt: 'Mini hamburguesa con queso cheddar y queso mozzarella',
  },
]
