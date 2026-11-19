import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import BotonTema from './BotonTema'

afterEach(() => {
  localStorage.removeItem('techasset.tema')
  document.documentElement.dataset.tema = 'claro'
  vi.unstubAllGlobals()
})

describe('BotonTema', () => {
  it('alterna sistema, oscuro y claro, y guarda solo los dos modos explícitos', async () => {
    const usuario = userEvent.setup()
    render(<BotonTema />)

    const boton = screen.getByRole('button', { name: /Tema del sistema/ })
    expect(boton).toHaveAccessibleName('Tema del sistema. Cambiar al tema oscuro')

    await usuario.click(boton)
    expect(document.documentElement.dataset.tema).toBe('oscuro')
    expect(localStorage.getItem('techasset.tema')).toBe('oscuro')
    expect(screen.getByRole('button', { name: /Tema oscuro/ })).toHaveAccessibleName(
      'Tema oscuro. Cambiar al tema claro',
    )

    await usuario.click(screen.getByRole('button', { name: /Tema oscuro/ }))
    expect(document.documentElement.dataset.tema).toBe('claro')
    expect(localStorage.getItem('techasset.tema')).toBe('claro')

    await usuario.click(screen.getByRole('button', { name: /Tema claro/ }))
    expect(localStorage.getItem('techasset.tema')).toBeNull()
    expect(screen.getByRole('button', { name: /Tema del sistema/ })).toBeInTheDocument()
  })

  it('respeta el modo guardado al montar', () => {
    localStorage.setItem('techasset.tema', 'oscuro')
    render(<BotonTema />)

    expect(document.documentElement.dataset.tema).toBe('oscuro')
    expect(screen.getByRole('button', { name: /Tema oscuro/ })).toBeInTheDocument()
  })

  it('con el sistema en oscuro ofrece el tema claro en el primer cambio', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    const usuario = userEvent.setup()

    render(<BotonTema />)

    expect(document.documentElement.dataset.tema).toBe('oscuro')
    const boton = screen.getByRole('button', { name: 'Tema del sistema. Cambiar al tema claro' })
    await usuario.click(boton)

    expect(document.documentElement.dataset.tema).toBe('claro')
    expect(localStorage.getItem('techasset.tema')).toBe('claro')
  })
})
