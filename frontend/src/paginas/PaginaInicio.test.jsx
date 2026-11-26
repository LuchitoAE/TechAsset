import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import PaginaInicio from './PaginaInicio'

vi.mock('../api/reportesApi', () => ({
  obtenerIndicadores: vi.fn(),
}))

vi.mock('../api/prestamosApi', () => ({
  listarPrestamos: vi.fn(),
}))

vi.mock('../contextos/contextoDeSesion', () => ({
  useSesion: vi.fn(),
}))

const { obtenerIndicadores } = await import('../api/reportesApi')
const { listarPrestamos } = await import('../api/prestamosApi')
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

beforeEach(() => {
  listarPrestamos.mockResolvedValue({ total: 0, pagina: 1, tamano: 3, prestamos: [] })
})

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

  it('la distribución muestra las cuatro barras, incluida Baja, y cuadra con el total', async () => {
    useSesion.mockReturnValue(sesion('Administrador'))
    obtenerIndicadores.mockResolvedValue({ ...INDICADORES, total_equipos: 10, equipos_disponibles: 4 })

    render(
      <MemoryRouter>
        <PaginaInicio />
      </MemoryRouter>,
    )

    const seccion = (await screen.findByRole('heading', { name: 'Distribución del inventario' }))
      .closest('section')

    expect(within(seccion).getByText('Disponibles · 40 %')).toBeInTheDocument()
    expect(within(seccion).getByText('Prestados · 20 %')).toBeInTheDocument()
    expect(within(seccion).getByText('En mantenimiento · 10 %')).toBeInTheDocument()
    expect(within(seccion).getByText('Baja · 30 %')).toBeInTheDocument()

    // 4 de 10 disponibles, 2 prestados, 1 en mantenimiento y 3 de baja: suma 10.
    expect(within(seccion).getByText('4')).toBeInTheDocument()
    expect(within(seccion).getByText('3')).toBeInTheDocument()
  })

  it('lista los tres préstamos más recientes con su estado', async () => {
    useSesion.mockReturnValue(sesion('Administrador'))
    obtenerIndicadores.mockResolvedValue(INDICADORES)
    listarPrestamos.mockResolvedValue({
      total: 1,
      pagina: 1,
      tamano: 3,
      prestamos: [
        {
          id_prestamo: 'p1',
          nombre_equipo: 'Proyector Epson',
          nombre_responsable: 'C. Mendoza',
          estado_prestamo: 'Activo',
        },
      ],
    })

    render(
      <MemoryRouter>
        <PaginaInicio />
      </MemoryRouter>,
    )

    const enlace = await screen.findByRole('link', { name: 'Proyector Epson' })
    expect(enlace).toHaveAttribute('href', '/prestamos/p1')

    const tabla = enlace.closest('table')
    expect(within(tabla).getByText('C. Mendoza')).toBeInTheDocument()
    expect(within(tabla).getByText('Activo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todos →' })).toHaveAttribute('href', '/prestamos')
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
