import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('ejecuta la acción al pulsarlo', async () => {
    const usuario = userEvent.setup()
    const alPulsar = vi.fn()

    render(<Button onClick={alPulsar}>Guardar</Button>)
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(alPulsar).toHaveBeenCalledTimes(1)
  })

  it('queda deshabilitado y avisa mientras carga', () => {
    render(
      <Button cargando textoCargando="Guardando…">
        Guardar
      </Button>,
    )

    const boton = screen.getByRole('button', { name: /Guardando/ })
    expect(boton).toBeDisabled()
    expect(boton).toHaveAttribute('aria-busy', 'true')
  })

  it('se deshabilita cuando la pantalla lo indica', () => {
    render(<Button disabled>Registrar</Button>)

    expect(screen.getByRole('button', { name: 'Registrar' })).toBeDisabled()
  })
})
