import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FormularioPrestamo from './FormularioPrestamo'

const EQUIPOS = [
  {
    id_equipo: 'eq-1',
    codigo_patrimonial_equipo: 'TK-2026-0001',
    nombre_equipo: 'Laptop Dell Latitude',
    categoria_equipo: 'Laptop',
    marca_equipo: 'Dell',
  },
  {
    id_equipo: 'eq-2',
    codigo_patrimonial_equipo: 'TK-2026-0002',
    nombre_equipo: 'Proyector Epson',
    categoria_equipo: 'ProyectorMultimedia',
    marca_equipo: 'Epson',
  },
]

function props(extra = {}) {
  return {
    valores: { id_equipo: '', fecha_devolucion: '' },
    errores: {},
    mensaje: null,
    enviando: false,
    faltanDatos: true,
    cambiar: vi.fn(),
    salirDelCampo: vi.fn(),
    enviar: vi.fn((evento) => evento?.preventDefault?.()),
    onCancelar: vi.fn(),
    equipos: EQUIPOS,
    cargandoEquipos: false,
    responsable: { nombre: 'Ana Pérez', correo: 'ana@innovatech.pe' },
    fechaMinima: '2026-11-18',
    ...extra,
  }
}

describe('FormularioPrestamo', () => {
  it('mantiene la solicitud activa y pide completar los obligatorios sin bloquear el envío', () => {
    render(<FormularioPrestamo {...props()} />)

    expect(screen.getByRole('button', { name: 'Solicitar préstamo' })).toBeEnabled()
    expect(screen.getByText('Aún faltan campos obligatorios; se marcarán al enviar la solicitud.')).toBeInTheDocument()
  })

  it('muestra el resumen accesible después de intentar enviar', () => {
    render(
      <FormularioPrestamo
        {...props({
          intentoEnviado: true,
          errores: { fecha_devolucion: 'Indique la fecha de devolución comprometida.' },
          resumenErrores: [
            {
              campo: 'fecha_devolucion',
              etiqueta: 'Fecha de devolución comprometida',
              mensaje: 'Indique la fecha de devolución comprometida.',
            },
          ],
        })}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Revise 1 campo antes de continuar.')
    expect(screen.getByRole('link', { name: /Fecha de devolución comprometida/ })).toHaveAttribute(
      'href',
      '#fecha_devolucion',
    )
  })

  it('ofrece solo los equipos disponibles y la fecha de devolución', async () => {
    const usuario = userEvent.setup()
    const cambiar = vi.fn()

    render(<FormularioPrestamo {...props({ faltanDatos: false, cambiar })} />)

    const selector = screen.getByRole('combobox', { name: /Equipo/ })
    expect(selector).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /TK-2026-0001 · Laptop Dell Latitude/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /TK-2026-0002 · Proyector Epson/ })).toBeInTheDocument()

    const fecha = screen.getByLabelText(/Fecha de devolución comprometida/)
    expect(fecha).toHaveAttribute('type', 'date')
    expect(fecha).toHaveAttribute('min', '2026-11-18')

    await usuario.selectOptions(selector, 'eq-2')
    expect(cambiar).toHaveBeenCalled()
  })

  it('muestra al colaborador de la sesión como responsable del préstamo', () => {
    render(<FormularioPrestamo {...props()} />)

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByText('ana@innovatech.pe')).toBeInTheDocument()
    expect(screen.getByText(/Todo préstamo registra un responsable/)).toBeInTheDocument()
  })

  it('avisa cuando no hay equipos disponibles', () => {
    render(<FormularioPrestamo {...props({ equipos: [] })} />)

    expect(
      screen.getByText('No hay equipos disponibles en este momento. Vuelva a intentarlo más tarde.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /Equipo/ })).toBeDisabled()
  })

  it('muestra el error del servidor junto al campo', () => {
    render(
      <FormularioPrestamo
        {...props({
          errores: { fecha_devolucion: 'La fecha de devolución debe ser posterior a la fecha de préstamo.' },
          mensaje: { tipo: 'error', texto: 'Revise los datos marcados.' },
        })}
      />,
    )

    expect(
      screen.getByText('La fecha de devolución debe ser posterior a la fecha de préstamo.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Revise los datos marcados.')).toBeInTheDocument()
  })
})
