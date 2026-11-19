import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import MigasDePan from './MigasDePan'

describe('MigasDePan', () => {
  it('marca la página actual y enlaza los niveles anteriores', () => {
    render(
      <MemoryRouter>
        <MigasDePan
          items={[
            { etiqueta: 'Inicio', ruta: '/' },
            { etiqueta: 'Equipos', ruta: '/equipos' },
            { etiqueta: 'TK-2026-0001' },
          ]}
        />
      </MemoryRouter>,
    )

    const navegacion = screen.getByRole('navigation', { name: 'Migas de pan' })
    expect(navegacion).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Equipos' })).toHaveAttribute('href', '/equipos')
    expect(screen.getByText('TK-2026-0001')).toHaveAttribute('aria-current', 'page')
  })
})
