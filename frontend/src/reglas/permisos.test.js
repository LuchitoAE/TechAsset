import { describe, expect, it } from 'vitest'
import {
  accesosDelRol,
  menuDelRol,
  puedeConsultarUsuarios,
  puedeDeshabilitarUsuarios,
  puedeGestionarUsuarios,
} from './permisos'

describe('permisos y navegación por rol', () => {
  it('el Administrador ve usuarios, equipos y reportes', () => {
    expect(menuDelRol('Administrador').map((opcion) => opcion.etiqueta)).toEqual([
      'Usuarios',
      'Equipos',
      'Reportes',
    ])
  })

  it('el Responsable ve equipos, préstamos e inventario', () => {
    expect(menuDelRol('ResponsableDeTecnologia').map((opcion) => opcion.etiqueta)).toEqual([
      'Equipos',
      'Préstamos',
      'Inventario',
    ])
  })

  it('el Colaborador ve sus préstamos y la disponibilidad', () => {
    expect(menuDelRol('Colaborador').map((opcion) => opcion.etiqueta)).toEqual([
      'Mis préstamos',
      'Disponibilidad',
    ])
  })

  it('solo el Administrador gestiona y deshabilita usuarios', () => {
    expect(puedeConsultarUsuarios('Administrador')).toBe(true)
    expect(puedeConsultarUsuarios('ResponsableDeTecnologia')).toBe(true)
    expect(puedeConsultarUsuarios('Colaborador')).toBe(false)

    expect(puedeGestionarUsuarios('Administrador')).toBe(true)
    expect(puedeGestionarUsuarios('ResponsableDeTecnologia')).toBe(false)

    expect(puedeDeshabilitarUsuarios('Administrador')).toBe(true)
    expect(puedeDeshabilitarUsuarios('ResponsableDeTecnologia')).toBe(false)
  })

  it('cada rol tiene accesos rápidos coherentes con su menú', () => {
    expect(accesosDelRol('Administrador')).toHaveLength(3)
    expect(accesosDelRol('Colaborador').map((acceso) => acceso.ruta)).toEqual([
      '/mis-prestamos',
      '/disponibilidad',
    ])
    expect(accesosDelRol('RolInexistente')).toEqual([])
  })
})
