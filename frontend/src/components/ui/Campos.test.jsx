import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AlertMessage from './AlertMessage'
import TextInput from './TextInput'

describe('TextInput', () => {
  it('asocia la etiqueta con el campo y muestra la ayuda', () => {
    render(<TextInput label="Correo" name="correo_usuario" ayuda="Use su correo corporativo." />)

    const campo = screen.getByLabelText('Correo')
    expect(campo).toHaveAttribute('name', 'correo_usuario')
    expect(campo).toHaveAccessibleDescription('Use su correo corporativo.')
  })

  it('muestra el error junto al campo y lo marca como inválido', () => {
    render(<TextInput label="Correo" name="correo_usuario" error="Escriba un correo válido." />)

    const campo = screen.getByLabelText('Correo')
    expect(campo).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Escriba un correo válido.')
  })
})

describe('AlertMessage', () => {
  it('usa role alert para los errores', () => {
    render(<AlertMessage tipo="error">No se pudo guardar.</AlertMessage>)

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo guardar.')
  })

  it('usa role status para las confirmaciones', () => {
    render(<AlertMessage tipo="exito">Usuario registrado.</AlertMessage>)

    expect(screen.getByRole('status')).toHaveTextContent('Usuario registrado.')
  })
})
