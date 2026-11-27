import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ProveedorDeAvisos from './ProveedorDeAvisos'
import { useAvisos } from './contextoDeAvisos'

function BotonDePrueba() {
  const { mostrarAviso, mostrarError } = useAvisos()

  return (
    <>
      <button type="button" onClick={() => mostrarAviso('Los cambios se guardaron.')}>
        Mostrar aviso
      </button>
      <button type="button" onClick={() => mostrarError('No se pudo completar la operación.')}>
        Mostrar error
      </button>
    </>
  )
}

function montar() {
  return render(
    <ProveedorDeAvisos>
      <BotonDePrueba />
    </ProveedorDeAvisos>,
  )
}

describe('Aviso flotante global (RNF-04)', () => {
  it('anuncia el éxito en una región role=status y se cierra con su botón', async () => {
    const usuario = userEvent.setup()
    montar()

    await usuario.click(screen.getByRole('button', { name: 'Mostrar aviso' }))

    const region = screen.getByRole('status')
    expect(within(region).getByText('Los cambios se guardaron.')).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Cerrar el aviso' }))
    expect(screen.queryByText('Los cambios se guardaron.')).not.toBeInTheDocument()
  })

  it('también anuncia los errores, con su propio estilo', async () => {
    const usuario = userEvent.setup()
    montar()

    await usuario.click(screen.getByRole('button', { name: 'Mostrar error' }))

    expect(screen.getByRole('status')).toHaveTextContent('No se pudo completar la operación.')
  })

  it('se cierra solo a los 8 s', () => {
    vi.useFakeTimers()
    try {
      montar()
      fireEvent.click(screen.getByRole('button', { name: 'Mostrar aviso' }))
      expect(screen.getByRole('status')).toHaveTextContent('Los cambios se guardaron.')

      act(() => vi.advanceTimersByTime(7999))
      expect(screen.getByRole('status')).toHaveTextContent('Los cambios se guardaron.')

      act(() => vi.advanceTimersByTime(1))
      expect(screen.getByRole('status')).not.toHaveTextContent('Los cambios se guardaron.')
    } finally {
      vi.useRealTimers()
    }
  })

  it('la región role=status existe aunque no haya aviso', () => {
    montar()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('admite varios avisos y retira el más antiguo al pasar de tres', () => {
    vi.useFakeTimers()
    try {
      montar()
      const boton = screen.getByRole('button', { name: 'Mostrar aviso' })

      fireEvent.click(boton)
      fireEvent.click(boton)
      fireEvent.click(boton)
      fireEvent.click(boton)

      expect(screen.getAllByRole('button', { name: 'Cerrar el aviso' })).toHaveLength(3)
      expect(screen.getAllByText('Los cambios se guardaron.')).toHaveLength(3)
    } finally {
      vi.useRealTimers()
    }
  })

  it('pausa el cierre mientras el puntero está sobre el aviso y lo reanuda al salir', () => {
    vi.useFakeTimers()
    try {
      montar()
      fireEvent.click(screen.getByRole('button', { name: 'Mostrar aviso' }))
      const texto = screen.getByText('Los cambios se guardaron.')

      fireEvent.mouseEnter(texto)
      act(() => vi.advanceTimersByTime(9000))
      expect(screen.getByText('Los cambios se guardaron.')).toBeInTheDocument()

      fireEvent.mouseLeave(texto)
      act(() => vi.advanceTimersByTime(7999))
      expect(screen.getByText('Los cambios se guardaron.')).toBeInTheDocument()

      act(() => vi.advanceTimersByTime(1))
      expect(screen.queryByText('Los cambios se guardaron.')).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('al cerrar un aviso con el foco, el foco pasa al siguiente', async () => {
    const usuario = userEvent.setup()
    montar()

    const mostrar = screen.getByRole('button', { name: 'Mostrar aviso' })
    await usuario.click(mostrar)
    await usuario.click(mostrar)

    const cerrar = screen.getAllByRole('button', { name: 'Cerrar el aviso' })
    await usuario.click(cerrar[0])

    await within(screen.getByRole('status')).findByText('Los cambios se guardaron.')
    const restante = screen.getByRole('button', { name: 'Cerrar el aviso' })
    await waitFor(() => expect(restante).toHaveFocus())
  })
})
