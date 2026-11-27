import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CardIndicador from './CardIndicador'

describe('CardIndicador', () => {
  it('muestra la etiqueta, el valor y el detalle', () => {
    render(
      <CardIndicador
        etiqueta="Equipos disponibles"
        valor={12}
        detalle="Listos para solicitar un préstamo."
      />,
    )

    expect(screen.getByRole('heading', { name: 'Equipos disponibles' })).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Listos para solicitar un préstamo.')).toBeInTheDocument()
  })

  it('acepta un valor largo, como el área con mayor uso, sin desbordar', () => {
    render(
      <CardIndicador
        etiqueta="Área con mayor uso"
        valor="Contabilidad, Soporte"
        valorClassName="text-xl"
      />,
    )

    expect(screen.getByText('Contabilidad, Soporte')).toHaveClass('text-xl')
  })
})
