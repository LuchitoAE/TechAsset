import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FormularioEquipo from './FormularioEquipo'

function props(extra = {}) {
  return {
    esNuevo: true,
    valores: {
      codigo_patrimonial_equipo: '',
      nombre_equipo: '',
      categoria_equipo: '',
      marca_equipo: '',
      estado_equipo: 'Disponible',
    },
    errores: {},
    mensaje: null,
    enviando: false,
    faltanDatos: true,
    cambiar: vi.fn(),
    salirDelCampo: vi.fn(),
    enviar: vi.fn((evento) => evento?.preventDefault?.()),
    onCancelar: vi.fn(),
    ...extra,
  }
}

describe('FormularioEquipo', () => {
  it('deshabilita Guardar mientras faltan datos obligatorios', () => {
    render(<FormularioEquipo {...props()} />)

    expect(screen.getByRole('button', { name: 'Registrar equipo' })).toBeDisabled()
    expect(screen.getByText('Complete los campos obligatorios para guardar.')).toBeInTheDocument()
  })

  it('agrupa identificación y clasificación, y permite escribir', async () => {
    const usuario = userEvent.setup()
    const cambiar = vi.fn()

    render(<FormularioEquipo {...props({ faltanDatos: false, cambiar })} />)

    expect(screen.getByRole('heading', { name: 'Identificación del equipo' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Clasificación y disponibilidad' }),
    ).toBeInTheDocument()

    await usuario.type(screen.getByLabelText(/Código patrimonial/), 'TK-2026-0001')
    expect(cambiar).toHaveBeenCalled()

    expect(screen.getByLabelText('Estado inicial')).toBeInTheDocument()
  })

  it('en la edición no muestra el selector de estado e informa el estado actual', () => {
    render(
      <FormularioEquipo
        {...props({
          esNuevo: false,
          faltanDatos: false,
          valores: {
            codigo_patrimonial_equipo: 'TK-2026-0001',
            nombre_equipo: 'Laptop Dell',
            categoria_equipo: 'Laptop',
            marca_equipo: 'Dell',
            estado_equipo: 'Mantenimiento',
          },
        })}
      />,
    )

    expect(screen.queryByLabelText('Estado inicial')).not.toBeInTheDocument()
    expect(screen.getByText('Estado actual')).toBeInTheDocument()
    expect(screen.getByText('Mantenimiento')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })

  it('muestra el error del servidor y el error de un campo', () => {
    render(
      <FormularioEquipo
        {...props({
          errores: { codigo_patrimonial_equipo: 'Ya existe un equipo con ese código patrimonial.' },
          mensaje: { tipo: 'error', texto: 'Ya existe un equipo con ese código patrimonial.' },
        })}
      />,
    )

    expect(screen.getAllByText('Ya existe un equipo con ese código patrimonial.').length).toBeGreaterThan(0)
  })
})
