import { useCallback, useEffect, useMemo, useState } from 'react'
import { precioANumero } from '../utils/precio.js'

// Debe coincidir con el máximo que acepta el backend (pedidos.js).
export const MAX_CANTIDAD = 20

const CLAVE_ALMACEN = 'biteandgo-carrito'

// Lee el carrito guardado. Si no existe, está dañado o el navegador
// bloquea el almacenamiento, empieza con un carrito vacío.
function leerCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_ALMACEN))
    if (!Array.isArray(guardado)) return []

    return guardado
      .filter(
        (linea) =>
          linea &&
          typeof linea.id === 'string' &&
          typeof linea.nombre === 'string' &&
          Number.isFinite(linea.precio) &&
          Number.isInteger(linea.cantidad) &&
          linea.cantidad > 0
      )
      .map((linea) => ({
        id: linea.id,
        nombre: linea.nombre,
        precio: linea.precio,
        imagen: typeof linea.imagen === 'string' ? linea.imagen : '',
        alt: typeof linea.alt === 'string' ? linea.alt : '',
        cantidad: Math.min(linea.cantidad, MAX_CANTIDAD),
      }))
  } catch {
    return []
  }
}

// Carrito de compras: vive en App y se guarda en el navegador para que
// no se pierda al recargar la página.
export function useCarrito() {
  const [lineas, setLineas] = useState(leerCarrito)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(lineas))
    } catch {
      // Sin almacenamiento disponible el carrito sigue funcionando en memoria.
    }
  }, [lineas])

  // Suma una unidad del producto (lo crea si aún no está en el carrito).
  const agregar = useCallback((producto) => {
    const precio = precioANumero(producto.precio)
    if (!Number.isFinite(precio) || precio <= 0) return

    setLineas((actuales) => {
      const existente = actuales.find((linea) => linea.id === producto.id)

      if (existente) {
        return actuales.map((linea) =>
          linea.id === producto.id
            ? { ...linea, cantidad: Math.min(linea.cantidad + 1, MAX_CANTIDAD) }
            : linea
        )
      }

      return [
        ...actuales,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio,
          imagen: producto.imagen,
          alt: producto.alt,
          cantidad: 1,
        },
      ]
    })
  }, [])

  // Cambia la cantidad en +1 / -1 sin salirse de 1..MAX_CANTIDAD.
  const cambiarCantidad = useCallback((id, diferencia) => {
    setLineas((actuales) =>
      actuales.map((linea) =>
        linea.id === id
          ? {
              ...linea,
              cantidad: Math.min(Math.max(linea.cantidad + diferencia, 1), MAX_CANTIDAD),
            }
          : linea
      )
    )
  }, [])

  const quitar = useCallback((id) => {
    setLineas((actuales) => actuales.filter((linea) => linea.id !== id))
  }, [])

  const vaciar = useCallback(() => setLineas([]), [])

  const { cantidadTotal, total } = useMemo(
    () => ({
      cantidadTotal: lineas.reduce((suma, linea) => suma + linea.cantidad, 0),
      total: lineas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0),
    }),
    [lineas]
  )

  return { lineas, cantidadTotal, total, agregar, cambiarCantidad, quitar, vaciar }
}
