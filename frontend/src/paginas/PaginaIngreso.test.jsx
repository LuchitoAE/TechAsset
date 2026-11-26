import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PaginaIngreso from './PaginaIngreso'

vi.mock('../api/autenticacionApi', () => ({
  ingresar: vi.fn(),
}))

vi.mock('../contextos/contextoDeSesion', () => ({
  useSesion: vi.fn(),
}))

const { useSesion } = await import('../contextos/contextoDeSesion')

afterEach(() => {
  vi.clearAllMocks()
})

function sinSesion() {
  useSesion.mockReturnValue({ sesion: null, iniciarSesion: vi.fn() })
}

describe('Ingreso', () => {
  it('presenta la marca, los roles y los dos campos del formulario', () => {
    sinSesion()

    render(
      <MemoryRouter>
        <PaginaIngreso />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Ingresar al sistema' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Correo corporativo/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/Contraseña/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeEnabled()

    expect(screen.getByText('Responsable de Tecnología')).toBeInTheDocument()
    expect(screen.getByText('Solicitudes y su historial')).toBeInTheDocument()
  })

  it('muestra la contraseña solo mientras se pide', async () => {
    sinSesion()
    const usuario = userEvent.setup()

    render(
      <MemoryRouter>
        <PaginaIngreso />
      </MemoryRouter>,
    )

    const contrasena = screen.getByLabelText(/Contraseña/)
    expect(contrasena).toHaveAttribute('type', 'password')

    await usuario.click(screen.getByRole('button', { name: 'Mostrar' }))
    expect(contrasena).toHaveAttribute('type', 'text')

    await usuario.click(screen.getByRole('button', { name: 'Ocultar' }))
    expect(contrasena).toHaveAttribute('type', 'password')
  })

  it('reclama los campos obligatorios sin llamar a la API', async () => {
    sinSesion()
    const usuario = userEvent.setup()

    render(
      <MemoryRouter>
        <PaginaIngreso />
      </MemoryRouter>,
    )

    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('El correo es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('La contraseña es obligatoria.')).toBeInTheDocument()
  })
})
