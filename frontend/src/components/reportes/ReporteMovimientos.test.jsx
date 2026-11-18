import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ReporteMovimientos from './ReporteMovimientos'

vi.mock('../../api/reportesApi', () => ({
  listarMovimientos: vi.fn(),
}))

const { listarMovimientos } = await import('../../api/reportesApi')

const PAGINA = {
  total: 1,
  pagina: 1,
  tamano: 20,
  movimientos: [
    {
      id_movimiento: 'mov-1',
      tipo_movimiento: 'EquipoRegistrado',
      fecha_movimiento: '2026-11-17T15:00:00Z',
      id_equipo: 'eq-1',
      codigo_patrimonial_equipo: 'TK-2026-0001',
      nombre_equipo: 'Laptop Dell Latitude',
      id_usuario: 'usr-1',
      nombre_usuario: 'Ana Pérez',
      detalle_movimiento: 'Se registró el equipo TK-2026-0001 (Laptop Dell Latitude) en estado Disponible.',
    },
  ],
}

describe('ReporteMovimientos', () => {
  beforeEach(() => {
    listarMovimientos.mockReset()
  })

  it('muestra el historial con su tipo, equipo, usuario y detalle', async () => {
    listarMovimientos.mockResolvedValue(PAGINA)

    render(<ReporteMovimientos />)

    expect(await screen.findByText('Alta de equipo')).toBeInTheDocument()
    expect(screen.getByText('TK-2026-0001')).toBeInTheDocument()
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByText(/Se registró el equipo/)).toBeInTheDocument()
    expect(screen.getByText(/17\/11\/2026, 10:00/)).toBeInTheDocument()
    expect(listarMovimientos).toHaveBeenCalledWith(
      expect.objectContaining({ pagina: 1, tamano: 20 }),
      expect.anything(),
    )
  })

  it('avisa cuando no hay movimientos con los filtros', async () => {
    listarMovimientos.mockResolvedValue({ total: 0, pagina: 1, tamano: 20, movimientos: [] })

    render(<ReporteMovimientos />)

    expect(await screen.findByText('No hay movimientos con esos filtros.')).toBeInTheDocument()
  })

  it('no consulta si la fecha inicial es posterior a la final', async () => {
    listarMovimientos.mockResolvedValue(PAGINA)

    render(<ReporteMovimientos />)
    await screen.findByText('Alta de equipo')

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-12-01' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-11-01' } })
    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }))

    expect(
      await screen.findByText('La fecha inicial no puede ser posterior a la fecha final.'),
    ).toBeInTheDocument()
    await waitFor(() => expect(listarMovimientos).toHaveBeenCalledTimes(1))
  })
})
