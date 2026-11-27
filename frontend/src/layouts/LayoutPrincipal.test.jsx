import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import LayoutPrincipal from './LayoutPrincipal'
import { VERSION_DEL_PRODUCTO } from '../reglas/version'

vi.mock('../contextos/contextoDeSesion', () => ({
  useSesion: vi.fn(),
}))

vi.mock('../contextos/contextoDeAvisos', () => ({
  useAvisos: vi.fn(),
}))

const { useSesion } = await import('../contextos/contextoDeSesion')
const { useAvisos } = await import('../contextos/contextoDeAvisos')

describe('Pie de la aplicación', () => {
  it('muestra la versión del producto desde una sola constante', () => {
    useSesion.mockReturnValue({
      sesion: {
        nombres_usuario: 'Ana',
        apellidos_usuario: 'Pérez',
        rol_usuario: 'Administrador',
      },
      cerrarSesion: vi.fn(),
    })
    useAvisos.mockReturnValue({ mostrarAviso: vi.fn() })

    render(
      <MemoryRouter>
        <Routes>
          <Route element={<LayoutPrincipal />}>
            <Route index element={<p>Contenido</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByText(`TechAsset · versión ${VERSION_DEL_PRODUCTO} · 2026`),
    ).toBeInTheDocument()
    expect(VERSION_DEL_PRODUCTO).toBe('1.0.0')
  })

  it('presenta el menú del rol, la ubicación y el acceso al contenido', () => {
    useSesion.mockReturnValue({
      sesion: {
        nombres_usuario: 'Ana',
        apellidos_usuario: 'Pérez',
        rol_usuario: 'Administrador',
      },
      cerrarSesion: vi.fn(),
    })
    useAvisos.mockReturnValue({ mostrarAviso: vi.fn() })

    render(
      <MemoryRouter initialEntries={['/panel']}>
        <Routes>
          <Route element={<LayoutPrincipal />}>
            <Route path="panel" element={<p>Contenido</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const menu = screen.getByRole('navigation', { name: 'Menú principal' })
    expect(within(menu).getByRole('link', { name: 'Panel' })).toHaveAttribute('href', '/panel')
    expect(within(menu).getByRole('link', { name: 'Reportes' })).toHaveAttribute('href', '/reportes')

    const ubicacion = screen.getByRole('navigation', { name: 'Ubicación' })
    expect(within(ubicacion).getByText('Panel')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Ir al contenido' })).toHaveAttribute(
      'href',
      '#contenido-principal',
    )
    expect(screen.getByText('Ana Pérez')).toHaveClass('truncate')
    expect(screen.getAllByText('AP').length).toBeGreaterThan(0)
  })
})
