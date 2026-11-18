import { describe, expect, it } from 'vitest'
import {
  estaVencido,
  fechaDeHoyEnLima,
  puedeAprobarse,
  puedeDevolverse,
  validarDevolucion,
  validarRechazo,
  validarSolicitudPrestamo,
} from './prestamos'
import { formatearFecha, sumarDias } from '../utils/fechas'

const HOY = '2026-11-17'

describe('validación de la solicitud de préstamo', () => {
  it('exige el equipo', () => {
    const errores = validarSolicitudPrestamo({ id_equipo: '', fecha_devolucion: '2026-11-20' }, { hoy: HOY })

    expect(errores.id_equipo).toBe('Seleccione el equipo que desea solicitar.')
  })

  it('exige la fecha de devolución', () => {
    const errores = validarSolicitudPrestamo({ id_equipo: 'eq-1', fecha_devolucion: '' }, { hoy: HOY })

    expect(errores.fecha_devolucion).toBe('Indique la fecha de devolución comprometida.')
  })

  it('rechaza una fecha que no tiene el formato AAAA-MM-DD', () => {
    const errores = validarSolicitudPrestamo(
      { id_equipo: 'eq-1', fecha_devolucion: '20/11/2026' },
      { hoy: HOY },
    )

    expect(errores.fecha_devolucion).toContain('fecha válida')
  })

  it.each([HOY, '2026-11-16'])('rechaza la fecha %s porque no es posterior a hoy', (fecha) => {
    const errores = validarSolicitudPrestamo({ id_equipo: 'eq-1', fecha_devolucion: fecha }, { hoy: HOY })

    expect(errores.fecha_devolucion).toBe(
      'La fecha de devolución debe ser posterior a la fecha de préstamo.',
    )
  })

  it('acepta una fecha posterior a hoy', () => {
    const errores = validarSolicitudPrestamo(
      { id_equipo: 'eq-1', fecha_devolucion: '2026-11-18' },
      { hoy: HOY },
    )

    expect(errores).toEqual({})
  })
})

describe('validación de la devolución y del rechazo', () => {
  it.each(['', '   ', 'mal'])('exige observaciones de al menos 5 caracteres (%s)', (observacion) => {
    const errores = validarDevolucion({ observacion_prestamo: observacion })

    expect(errores.observacion_prestamo).toBeTruthy()
  })

  it('acepta una observación completa', () => {
    const errores = validarDevolucion({
      observacion_prestamo: 'Devuelto con el cargador y la funda, sin golpes.',
    })

    expect(errores).toEqual({})
  })

  it('exige el motivo del rechazo', () => {
    const errores = validarRechazo({ motivo_rechazo_prestamo: '' })

    expect(errores.motivo_rechazo_prestamo).toBe('Registre el motivo del rechazo.')
  })

  it('rechaza textos de más de 500 caracteres', () => {
    const errores = validarRechazo({ motivo_rechazo_prestamo: 'x'.repeat(501) })

    expect(errores.motivo_rechazo_prestamo).toContain('entre 5 y 500')
  })
})

describe('estado y vencimiento del préstamo', () => {
  it('un préstamo activo con la fecha pasada está vencido', () => {
    const prestamo = { estado_prestamo: 'Activo', fecha_devolucion: '2026-11-15' }

    expect(estaVencido(prestamo, HOY)).toBe(true)
  })

  it('un préstamo activo dentro del plazo no está vencido', () => {
    const prestamo = { estado_prestamo: 'Activo', fecha_devolucion: '2026-11-20' }

    expect(estaVencido(prestamo, HOY)).toBe(false)
  })

  it('un préstamo devuelto no está vencido aunque la fecha haya pasado', () => {
    const prestamo = { estado_prestamo: 'Devuelto', fecha_devolucion: '2026-11-15' }

    expect(estaVencido(prestamo, HOY)).toBe(false)
  })

  it('solo se aprueba lo solicitado y solo se devuelve lo activo', () => {
    expect(puedeAprobarse({ estado_prestamo: 'Solicitado' })).toBe(true)
    expect(puedeAprobarse({ estado_prestamo: 'Activo' })).toBe(false)
    expect(puedeDevolverse({ estado_prestamo: 'Activo' })).toBe(true)
    expect(puedeDevolverse({ estado_prestamo: 'Devuelto' })).toBe(false)
  })
})

describe('fechas de negocio', () => {
  it('la fecha de hoy en Lima tiene el formato AAAA-MM-DD', () => {
    expect(fechaDeHoyEnLima()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('sumar días cruza el fin de mes y de año', () => {
    expect(sumarDias('2026-11-30', 1)).toBe('2026-12-01')
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('formatea la fecha como dd/mm/aaaa y deja un guion cuando no hay fecha', () => {
    expect(formatearFecha('2026-11-07')).toBe('07/11/2026')
    expect(formatearFecha(null)).toBe('—')
  })
})
