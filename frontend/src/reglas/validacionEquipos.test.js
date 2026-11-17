import { describe, expect, it } from 'vitest'
import {
  estadosDisponiblesPara,
  normalizarCodigoPatrimonial,
  puedeCambiarEstado,
  tieneErrores,
  validarEdicionEquipo,
  validarEquipo,
} from './validacionEquipos'

const EQUIPO_VALIDO = {
  codigo_patrimonial_equipo: 'TK-2026-0001',
  nombre_equipo: 'Laptop Dell Latitude 5440',
  categoria_equipo: 'Laptop',
  marca_equipo: 'Dell',
  estado_equipo: 'Disponible',
}

describe('validación de equipos', () => {
  it('acepta un equipo completo y válido', () => {
    expect(validarEquipo(EQUIPO_VALIDO)).toEqual({})
    expect(tieneErrores(validarEquipo(EQUIPO_VALIDO))).toBe(false)
  })

  it('exige código, nombre, categoría, marca y estado inicial', () => {
    const errores = validarEquipo({
      codigo_patrimonial_equipo: '',
      nombre_equipo: '',
      categoria_equipo: '',
      marca_equipo: '',
      estado_equipo: '',
    })

    expect(errores.codigo_patrimonial_equipo).toBeDefined()
    expect(errores.nombre_equipo).toBeDefined()
    expect(errores.categoria_equipo).toBeDefined()
    expect(errores.marca_equipo).toBeDefined()
    expect(errores.estado_equipo).toBeDefined()
  })

  it('normaliza el código patrimonial con espacios y mayúsculas', () => {
    expect(normalizarCodigoPatrimonial('  tk-2026-0001 ')).toBe('TK-2026-0001')
    expect(validarEquipo({ ...EQUIPO_VALIDO, codigo_patrimonial_equipo: '  tk-2026-0001 ' })).toEqual(
      {},
    )
  })

  it('rechaza un código de más de 50 caracteres y un nombre fuera de rango', () => {
    const errores = validarEquipo({
      ...EQUIPO_VALIDO,
      codigo_patrimonial_equipo: 'X'.repeat(51),
      nombre_equipo: 'XY',
    })

    expect(errores.codigo_patrimonial_equipo).toContain('50')
    expect(errores.nombre_equipo).toContain('3 y 100')
  })

  it('rechaza una categoría fuera del catálogo y una marca demasiado corta', () => {
    const errores = validarEquipo({
      ...EQUIPO_VALIDO,
      categoria_equipo: 'Servidor',
      marca_equipo: 'D',
    })

    expect(errores.categoria_equipo).toContain('categoría')
    expect(errores.marca_equipo).toContain('2 y 50')
  })

  it('no permite registrar un equipo como Prestado', () => {
    const errores = validarEquipo({ ...EQUIPO_VALIDO, estado_equipo: 'Prestado' })

    expect(errores.estado_equipo).toContain('Disponible')
  })

  it('en la edición el estado no se valida porque se cambia aparte', () => {
    expect(validarEdicionEquipo({ ...EQUIPO_VALIDO, estado_equipo: 'Prestado' })).toEqual({})
  })

  it('un equipo prestado no ofrece cambios manuales de estado', () => {
    const prestado = { ...EQUIPO_VALIDO, estado_equipo: 'Prestado' }
    const disponible = { ...EQUIPO_VALIDO, estado_equipo: 'Disponible' }

    expect(puedeCambiarEstado(prestado)).toBe(false)
    expect(estadosDisponiblesPara(prestado)).toEqual([])

    expect(puedeCambiarEstado(disponible)).toBe(true)
    expect(estadosDisponiblesPara(disponible).map((estado) => estado.valor)).toEqual([
      'Mantenimiento',
      'Baja',
    ])
  })

  it('un equipo de baja se puede reincorporar', () => {
    const deBaja = { ...EQUIPO_VALIDO, estado_equipo: 'Baja' }

    expect(puedeCambiarEstado(deBaja)).toBe(true)
    expect(estadosDisponiblesPara(deBaja).map((estado) => estado.valor)).toEqual([
      'Disponible',
      'Mantenimiento',
    ])
  })
})
