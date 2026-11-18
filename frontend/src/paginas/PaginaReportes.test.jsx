import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PaginaReportes from './PaginaReportes'

vi.mock('../components/reportes/ReporteEquiposPorEstado', () => ({
  default: () => <p>Panel de equipos por estado</p>,
}))
vi.mock('../components/reportes/ReporteEquiposMasUtilizados', () => ({
  default: () => <p>Panel de equipos más utilizados</p>,
}))
vi.mock('../components/reportes/ReportePrestamosPorArea', () => ({
  default: () => <p>Panel de préstamos por área</p>,
}))
vi.mock('../components/reportes/ReporteMovimientos', () => ({
  default: () => <p>Panel de movimientos</p>,
}))

describe('PaginaReportes', () => {
  it('abre el primer reporte y cambia de pestaña', async () => {
    const usuario = userEvent.setup()

    render(<PaginaReportes />)

    expect(screen.getByRole('tab', { name: 'Equipos por estado' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('Panel de equipos por estado')).toBeInTheDocument()

    await usuario.click(screen.getByRole('tab', { name: 'Movimientos' }))

    expect(screen.getByText('Panel de movimientos')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Movimientos' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('recorre las pestañas con las flechas del teclado', async () => {
    const usuario = userEvent.setup()

    render(<PaginaReportes />)

    const primera = screen.getByRole('tab', { name: 'Equipos por estado' })
    primera.focus()
    await usuario.keyboard('{ArrowRight}')

    expect(screen.getByRole('tab', { name: 'Más utilizados' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('Panel de equipos más utilizados')).toBeInTheDocument()
  })
})
