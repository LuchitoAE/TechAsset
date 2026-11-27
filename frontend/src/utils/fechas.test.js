import { describe, expect, it } from 'vitest'
import { formatearFecha, sumarDias } from './fechas'

describe('fechas civiles', () => {
  it('muestra la fecha es-PE sin pasar por la zona horaria del navegador', () => {
    expect(formatearFecha('2026-11-17')).toBe('17/11/2026')
    expect(formatearFecha('2026-01-05')).toBe('05/01/2026')
    expect(formatearFecha(null)).toBe('—')
    expect(formatearFecha('sin fecha')).toBe('sin fecha')
  })

  it('suma días a una fecha civil y cruza el cambio de mes', () => {
    expect(sumarDias('2026-11-30', 1)).toBe('2026-12-01')
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01')
    expect(sumarDias('2026-11-17', 7)).toBe('2026-11-24')
  })
})
