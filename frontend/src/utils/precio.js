// Los precios del menú vienen como texto ("$12.000"), en pesos colombianos.
// Aquí los convertimos a número para poder sumar y mostrar totales.

// "$12.000" -> 12000
export function precioANumero(precio) {
  const digitos = String(precio ?? '').replace(/\D/g, '')
  return digitos ? parseInt(digitos, 10) : NaN
}

const formato = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

// 12000 -> "$ 12.000"
export function formatearPrecio(valor) {
  return formato.format(valor)
}
