import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useFormulario } from './useFormulario'

const validar = (valores) => (valores.nombre ? {} : { nombre: 'El nombre es obligatorio.' })

describe('useFormulario', () => {
  it('no envía si hay errores y enfoca el primer campo con error', async () => {
    const alEnviar = vi.fn()

    const { result } = renderHook(() =>
      useFormulario({
        valoresIniciales: { nombre: '' },
        validar,
        alEnviar,
        camposObligatorios: ['nombre'],
      }),
    )

    expect(result.current.faltanDatos).toBe(true)

    await act(async () => {
      await result.current.enviar()
    })

    expect(result.current.errores.nombre).toBe('El nombre es obligatorio.')
    expect(alEnviar).not.toHaveBeenCalled()
  })

  it('envía cuando los datos son válidos y reporta el estado ocupado', async () => {
    let resolver
    const alEnviar = vi.fn(
      () =>
        new Promise((listo) => {
          resolver = listo
        }),
    )

    const { result } = renderHook(() =>
      useFormulario({
        valoresIniciales: { nombre: 'Ana' },
        validar,
        alEnviar,
        camposObligatorios: ['nombre'],
      }),
    )

    act(() => {
      result.current.enviar()
    })

    expect(result.current.enviando).toBe(true)

    await act(async () => {
      resolver()
    })

    expect(alEnviar).toHaveBeenCalledWith({ nombre: 'Ana' })
    expect(result.current.enviando).toBe(false)
  })

  it('traduce los errores por campo que devuelve la API', async () => {
    const errorDeApi = Object.assign(new Error('Ya existe un usuario con ese correo.'), {
      name: 'ErrorDeApi',
      errores: { correo_usuario: ['Ya existe un usuario con ese correo.'] },
    })

    const { ErrorDeApi } = await import('../api/clienteApi')
    Object.setPrototypeOf(errorDeApi, ErrorDeApi.prototype)

    const alEnviar = vi.fn().mockRejectedValue(errorDeApi)

    const { result } = renderHook(() =>
      useFormulario({
        valoresIniciales: { nombre: 'Ana', correo_usuario: 'ana@innovatech.pe' },
        validar: () => ({}),
        alEnviar,
      }),
    )

    await act(async () => {
      await result.current.enviar()
    })

    expect(result.current.errores.correo_usuario).toBe('Ya existe un usuario con ese correo.')
    expect(result.current.mensaje).toEqual({
      tipo: 'error',
      texto: 'Ya existe un usuario con ese correo.',
    })
  })
})
