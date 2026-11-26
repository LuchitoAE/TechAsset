import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import PaginaLanding from './PaginaLanding'

describe('Landing pública', () => {
  it('presenta el producto y lleva al ingreso desde la barra y el cierre', () => {
    render(
      <MemoryRouter>
        <PaginaLanding />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Inventario y préstamos de equipos, sin hojas de cálculo/,
      }),
    ).toBeInTheDocument()

    const ingresos = screen.getAllByRole('link', { name: 'Ingresar al sistema' })
    expect(ingresos).toHaveLength(2)
    for (const enlace of ingresos) {
      expect(enlace).toHaveAttribute('href', '/ingreso')
    }
  })

  it('resume el producto en cifras y en las tres características', () => {
    render(
      <MemoryRouter>
        <PaginaLanding />
      </MemoryRouter>,
    )

    const cifras = screen.getByRole('region', { name: 'TechAsset en cifras' })
    expect(within(cifras).getByText('128')).toBeInTheDocument()
    expect(within(cifras).getByText('24')).toBeInTheDocument()

    const caracteristicas = screen.getByRole('region', {
      name: 'Todo el ciclo del equipo, en un solo lugar',
    })
    expect(within(caracteristicas).getByRole('heading', { name: 'Inventario vivo' })).toBeInTheDocument()
    expect(
      within(caracteristicas).getByRole('heading', { name: 'Préstamos controlados' }),
    ).toBeInTheDocument()
    expect(within(caracteristicas).getByRole('heading', { name: 'Reportes al instante' })).toBeInTheDocument()
  })

  it('numera los tres pasos del flujo de préstamo', () => {
    render(
      <MemoryRouter>
        <PaginaLanding />
      </MemoryRouter>,
    )

    const pasos = screen.getByRole('list', { name: 'Pasos del flujo' })
    expect(within(pasos).getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('Paso 1')).toBeInTheDocument()
    expect(screen.getByText('Paso 3')).toBeInTheDocument()
  })
})
