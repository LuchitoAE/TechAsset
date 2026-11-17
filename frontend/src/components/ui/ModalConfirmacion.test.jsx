import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ModalConfirmacion from './ModalConfirmacion'

describe('ModalConfirmacion', () => {
  it('no se muestra cuando está cerrado', () => {
    render(
      <ModalConfirmacion
        abierto={false}
        titulo="Deshabilitar usuario"
        mensaje="No podrá ingresar."
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('confirma la acción y se cierra con Escape', async () => {
    const usuario = userEvent.setup()
    const alConfirmar = vi.fn()
    const alCancelar = vi.fn()

    render(
      <ModalConfirmacion
        abierto
        titulo="Deshabilitar usuario"
        mensaje="No podrá ingresar."
        textoConfirmar="Deshabilitar"
        onConfirmar={alConfirmar}
        onCancelar={alCancelar}
      />,
    )

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Deshabilitar usuario')
    await usuario.click(screen.getByRole('button', { name: 'Deshabilitar' }))
    expect(alConfirmar).toHaveBeenCalledTimes(1)

    await usuario.keyboard('{Escape}')
    expect(alCancelar).toHaveBeenCalled()
  })
})
