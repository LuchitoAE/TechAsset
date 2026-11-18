import { render, screen } from '@testing-library/react'
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
})
