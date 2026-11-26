import { describe, expect, it } from 'vitest'
import {
  accesosDelRol,
  menuDelRol,
  puedeConsultarPrestamosActivos,
  puedeConsultarReportes,
  puedeConsultarUsuarios,
  puedeDeshabilitarUsuarios,
  puedeGestionarEquipos,
  puedeGestionarPrestamos,
  puedeGestionarUsuarios,
  puedeSolicitarPrestamos,
} from './permisos'

describe('permisos y navegación por rol', () => {
  it('el Administrador ve usuarios, equipos, préstamos y reportes', () => {
    expect(menuDelRol('Administrador').map((opcion) => opcion.etiqueta)).toEqual([
      'Panel',
      'Usuarios',
      'Equipos',
      'Préstamos',
      'Reportes',
    ])
  })

  it('el Responsable ve equipos, préstamos y reportes', () => {
    expect(menuDelRol('ResponsableDeTecnologia').map((opcion) => opcion.etiqueta)).toEqual([
      'Panel',
      'Equipos',
      'Préstamos',
      'Reportes',
    ])
  })

  it('el Colaborador ve el inventario, sus préstamos y la disponibilidad', () => {
    expect(menuDelRol('Colaborador').map((opcion) => opcion.etiqueta)).toEqual([
      'Panel',
      'Equipos',
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

  it('el Administrador y el Responsable gestionan equipos; el Colaborador solo consulta', () => {
    expect(puedeGestionarEquipos('Administrador')).toBe(true)
    expect(puedeGestionarEquipos('ResponsableDeTecnologia')).toBe(true)
    expect(puedeGestionarEquipos('Colaborador')).toBe(false)
  })

  it('solo el Colaborador solicita préstamos', () => {
    expect(puedeSolicitarPrestamos('Colaborador')).toBe(true)
    expect(puedeSolicitarPrestamos('ResponsableDeTecnologia')).toBe(false)
    expect(puedeSolicitarPrestamos('Administrador')).toBe(false)
  })

  it('el Responsable y el Administrador aprueban, devuelven y consultan los activos', () => {
    expect(puedeGestionarPrestamos('Administrador')).toBe(true)
    expect(puedeGestionarPrestamos('ResponsableDeTecnologia')).toBe(true)
    expect(puedeGestionarPrestamos('Colaborador')).toBe(false)

    expect(puedeConsultarPrestamosActivos('Administrador')).toBe(true)
    expect(puedeConsultarPrestamosActivos('ResponsableDeTecnologia')).toBe(true)
    expect(puedeConsultarPrestamosActivos('Colaborador')).toBe(false)
  })

  it('cada rol tiene accesos rápidos coherentes con su menú', () => {
    expect(accesosDelRol('Administrador')).toHaveLength(4)
    expect(accesosDelRol('ResponsableDeTecnologia')).toHaveLength(3)
    expect(accesosDelRol('Colaborador').map((acceso) => acceso.ruta)).toEqual([
      '/equipos',
      '/mis-prestamos',
      '/disponibilidad',
    ])
    expect(accesosDelRol('RolInexistente')).toEqual([])
  })
})

describe('reportes por rol', () => {
  it('solo el Administrador y el Responsable consultan los reportes', () => {
    expect(puedeConsultarReportes('Administrador')).toBe(true)
    expect(puedeConsultarReportes('ResponsableDeTecnologia')).toBe(true)
    expect(puedeConsultarReportes('Colaborador')).toBe(false)
  })
})
