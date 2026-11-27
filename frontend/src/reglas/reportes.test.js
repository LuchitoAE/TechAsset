import { describe, expect, it } from 'vitest'
import {
  anchoDeBarra,
  anuncioDeOrden,
  distribucionDelInventario,
  etiquetaDeTipoMovimiento,
  formatearFechaYHora,
  formatearPorcentaje,
  ordenarFilas,
  resumenDeAreas,
  siguienteOrden,
  validarRangoDeFechas,
} from './reportes'

describe('reglas de los reportes', () => {
  it('traduce el tipo de movimiento a una etiqueta legible', () => {
    expect(etiquetaDeTipoMovimiento('PrestamoDevuelto')).toBe('Préstamo devuelto')
    expect(etiquetaDeTipoMovimiento('Otro')).toBe('Otro')
  })

  it('resume las áreas y avisa cuando no hay préstamos', () => {
    expect(resumenDeAreas(['Contabilidad', 'Soporte'])).toBe('Contabilidad, Soporte')
    expect(resumenDeAreas([])).toBe('Sin préstamos')
    expect(resumenDeAreas(undefined)).toBe('Sin préstamos')
  })

  it('escribe el porcentaje con coma decimal', () => {
    expect(formatearPorcentaje(66.7)).toBe('66,7 %')
    expect(formatearPorcentaje(0)).toBe('0,0 %')
    expect(formatearPorcentaje('sin dato')).toBe('0 %')
  })

  it('acota el ancho de la barra entre 0 y 100', () => {
    expect(anchoDeBarra(33.3)).toBe('33.3%')
    expect(anchoDeBarra(-4)).toBe('0%')
    expect(anchoDeBarra(140)).toBe('100%')
    expect(anchoDeBarra('x')).toBe('0%')
  })

  it('rechaza un rango de fechas al revés', () => {
    expect(validarRangoDeFechas('2026-12-01', '2026-11-01')).toEqual({
      desde: 'La fecha inicial no puede ser posterior a la fecha final.',
    })
    expect(validarRangoDeFechas('2026-11-01', '2026-11-30')).toEqual({})
    expect(validarRangoDeFechas('', '2026-11-30')).toEqual({})
  })

  it('muestra la fecha y hora del movimiento en la zona de Lima', () => {
    const texto = formatearFechaYHora('2026-11-17T15:00:00Z')

    expect(texto).toContain('17/11/2026')
    expect(texto).toContain('10:00')
    expect(formatearFechaYHora(null)).toBe('—')
  })

  it('la distribución incluye la barra de Baja y suma el total de equipos', () => {
    const filas = distribucionDelInventario({
      total_equipos: 10,
      equipos_disponibles: 4,
      equipos_prestados: 3,
      equipos_mantenimiento: 2,
    })

    expect(filas.map((fila) => fila.etiqueta)).toEqual([
      'Disponibles',
      'Prestados',
      'En mantenimiento',
      'Baja',
    ])
    expect(filas.map((fila) => fila.valor)).toEqual([4, 3, 2, 1])
    expect(filas.map((fila) => fila.porcentaje)).toEqual([40, 30, 20, 10])
    expect(filas.reduce((suma, fila) => suma + fila.valor, 0)).toBe(10)
  })

  it('no inventa equipos de baja cuando la API no trae datos', () => {
    const filas = distribucionDelInventario()

    expect(filas).toHaveLength(4)
    expect(filas.every((fila) => fila.valor === 0 && fila.porcentaje === 0)).toBe(true)
  })

  it('ordena texto en español y números como números sin mutar el arreglo original', () => {
    const filas = [
      { area: 'Soporte', total: 2 },
      { area: 'Administración', total: 10 },
      { area: 'contabilidad', total: 1 },
    ]

    expect(ordenarFilas(filas, { clave: 'area' }).map((fila) => fila.area)).toEqual([
      'Administración',
      'contabilidad',
      'Soporte',
    ])
    expect(ordenarFilas(filas, { clave: 'total', tipo: 'numero' }).map((fila) => fila.total)).toEqual([
      1, 2, 10,
    ])
    expect(
      ordenarFilas(filas, { clave: 'total', tipo: 'numero', direccion: 'descendente' }).map(
        (fila) => fila.total,
      ),
    ).toEqual([10, 2, 1])
    expect(filas.map((fila) => fila.total)).toEqual([2, 10, 1])
  })

  it('cambia la columna ordenada y alterna la dirección al repetirla', () => {
    const columnas = [
      { etiqueta: 'Área', clave: 'area', tipo: 'texto' },
      { etiqueta: 'Préstamos', clave: 'total', tipo: 'numero' },
    ]

    const primera = siguienteOrden(undefined, columnas[0])
    expect(primera).toEqual({ clave: 'area', direccion: 'ascendente', tipo: 'texto' })

    const repetida = siguienteOrden(primera, columnas[0])
    expect(repetida.direccion).toBe('descendente')

    const otra = siguienteOrden(repetida, columnas[1])
    expect(otra).toEqual({ clave: 'total', direccion: 'ascendente', tipo: 'numero' })
    expect(anuncioDeOrden(otra, columnas)).toBe(
      'Tabla ordenada por Préstamos, en orden ascendente.',
    )
  })
})
