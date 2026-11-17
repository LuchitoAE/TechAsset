import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FormularioUsuario from './FormularioUsuario'

function props(extra = {}) {
  return {
    esNuevo: true,
    valores: {
      nombres_usuario: '',
      apellidos_usuario: '',
      correo_usuario: '',
      area_usuario: '',
      rol_usuario: '',
      contrasena: '',
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

describe('FormularioUsuario', () => {
  it('deshabilita Guardar mientras faltan datos obligatorios', () => {
    render(<FormularioUsuario {...props()} />)

    expect(screen.getByRole('button', { name: 'Registrar usuario' })).toBeDisabled()
    expect(screen.getByText('Complete los campos obligatorios para guardar.')).toBeInTheDocument()
  })

  it('agrupa los campos y permite mostrar la contraseña', async () => {
    const usuario = userEvent.setup()
    const cambiar = vi.fn()

    render(<FormularioUsuario {...props({ faltanDatos: false, cambiar })} />)

    expect(screen.getByRole('heading', { name: 'Datos de la persona' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Acceso y permisos' })).toBeInTheDocument()

    const contrasena = screen.getByLabelText(/Contraseña inicial/)
    expect(contrasena).toHaveAttribute('type', 'password')

    await usuario.click(screen.getByRole('button', { name: 'Mostrar' }))
    expect(contrasena).toHaveAttribute('type', 'text')

    await usuario.type(screen.getByLabelText('Nombres'), 'A')
    expect(cambiar).toHaveBeenCalled()
  })

  it('muestra el error del servidor junto al formulario', () => {
    render(
      <FormularioUsuario
        {...props({ mensaje: { tipo: 'error', texto: 'Ya existe un usuario con ese correo.' } })}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Ya existe un usuario con ese correo.')
  })
})
