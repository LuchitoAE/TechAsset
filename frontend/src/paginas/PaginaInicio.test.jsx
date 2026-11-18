import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PaginaInicio from './PaginaInicio'

vi.mock('../api/reportesApi', () => ({
  obtenerIndicadores: vi.fn(),
}))

vi.mock('../contextos/contextoDeSesion', () => ({
  useSesion: vi.fn(),
}))

const { obtenerIndicadores } = await import('../api/reportesApi')
const { useSesion } = await import('../contextos/contextoDeSesion')

const INDICADORES = {
  total_equipos: 9,
  equipos_disponibles: 5,
  equipos_prestados: 2,
  equipos_mantenimiento: 1,
  total_prestamos: 4,
  areas_con_mayor_uso: ['Contabilidad', 'Soporte'],
  fecha_corte: '2026-11-17T15:00:00Z',
}

function sesion(rol) {
  return {
    sesion: {
      nombres_usuario: 'Ana',
      apellidos_usuario: 'Pérez',
      rol_usuario: rol,
    },
    cerrarSesion: vi.fn(),
  }
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('Panel de inicio', () => {
  it('muestra los seis indicadores mínimos y la fecha de corte', async () => {
    useSesion.mockReturnValue(sesion('Administrador'))
    obtenerIndicadores.mockResolvedValue(INDICADORES)

    render(
      <MemoryRouter>
        <PaginaInicio />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Total de equipos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Equipos disponibles' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Equipos prestados' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'En mantenimiento' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Total de préstamos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Área con mayor uso' })).toBeInTheDocument()
    expect(screen.getByText('Contabilidad, Soporte')).toBeInTheDocument()
    expect(screen.getByText(/17\/11\/2026/)).toBeInTheDocument()
  })

  it('avisa al Colaborador que los préstamos y el área son solo suyos', async () => {
    useSesion.mockReturnValue(sesion('Colaborador'))
    obtenerIndicadores.mockResolvedValue(INDICADORES)

    render(
      <MemoryRouter>
        <PaginaInicio />
      </MemoryRouter>,
    )

    expect(
      await screen.findByText(/El total de préstamos y el área con mayor uso son solo suyos/),
    ).toBeInTheDocument()
  })

  it('ofrece reintentar cuando la consulta falla', async () => {
    useSesion.mockReturnValue(sesion('Administrador'))
    obtenerIndicadores.mockRejectedValue(new Error('No se pudo conectar con el servidor.'))

    render(
      <MemoryRouter>
        <PaginaInicio />
      </MemoryRouter>,
    )

    expect(
      await screen.findByText('No se pudo conectar con el servidor.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    await waitFor(() => expect(obtenerIndicadores).toHaveBeenCalledTimes(1))
  })
})
