import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ReporteEquiposPorEstado from './ReporteEquiposPorEstado'

vi.mock('../../api/reportesApi', () => ({
  listarEquiposPorEstado: vi.fn(),
}))

const { listarEquiposPorEstado } = await import('../../api/reportesApi')

function equipo(extra = {}) {
  return {
    id_equipo: 'eq-1',
    codigo_patrimonial_equipo: 'TK-2026-0001',
    nombre_equipo: 'Laptop Dell Latitude',
    categoria_equipo: 'Laptop',
    marca_equipo: 'Dell',
    estado_equipo: 'Disponible',
    disponible_equipo: true,
    ...extra,
  }
}

describe('ReporteEquiposPorEstado', () => {
  it('muestra los cuatro estados con su total y su lista', async () => {
    listarEquiposPorEstado.mockResolvedValue({
      total: 2,
      estados: [
        { estado_equipo: 'Disponible', total: 1, equipos: [equipo()] },
        {
          estado_equipo: 'Prestado',
          total: 1,
          equipos: [equipo({ id_equipo: 'eq-2', codigo_patrimonial_equipo: 'TK-2026-0002', estado_equipo: 'Prestado' })],
        },
        { estado_equipo: 'Mantenimiento', total: 0, equipos: [] },
        { estado_equipo: 'Baja', total: 0, equipos: [] },
      ],
    })

    render(<ReporteEquiposPorEstado />)

    expect(await screen.findByText(/2 equipos en total/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Disponible' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Prestado' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mantenimiento' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Baja' })).toBeInTheDocument()
    expect(screen.getByText('TK-2026-0001')).toBeInTheDocument()
    expect(screen.getByText('TK-2026-0002')).toBeInTheDocument()
    expect(screen.getAllByText('Sin equipos en este estado.')).toHaveLength(2)
  })

  it('avisa cuando los filtros no encuentran equipos', async () => {
    listarEquiposPorEstado.mockResolvedValue({ total: 0, estados: [] })

    render(<ReporteEquiposPorEstado />)

    expect(await screen.findByText('No hay equipos con esos filtros.')).toBeInTheDocument()
  })
})
