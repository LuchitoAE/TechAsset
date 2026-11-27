import { describe, expect, it } from 'vitest'
import {
  tieneErrores,
  validarContrasena,
  validarCorreo,
  validarEdicionUsuario,
  validarIngreso,
  validarUsuario,
} from './validacionUsuarios'

const USUARIO_VALIDO = {
  nombres_usuario: 'Ana',
  apellidos_usuario: 'Pérez',
  correo_usuario: 'ana.perez@innovatech.pe',
  area_usuario: 'Tecnología',
  rol_usuario: 'Colaborador',
  contrasena: 'Clave1234',
}

describe('validación de usuarios', () => {
  it('acepta un usuario completo y válido', () => {
    expect(validarUsuario(USUARIO_VALIDO)).toEqual({})
    expect(tieneErrores(validarUsuario(USUARIO_VALIDO))).toBe(false)
  })

  it('exige nombres, apellidos, correo, área y rol', () => {
    const errores = validarUsuario(
      {
        nombres_usuario: '',
        apellidos_usuario: '',
        correo_usuario: '',
        area_usuario: '',
        rol_usuario: '',
        contrasena: '',
      },
      { esNuevo: true },
    )

    expect(errores.nombres_usuario).toBeDefined()
    expect(errores.apellidos_usuario).toBeDefined()
    expect(errores.correo_usuario).toBeDefined()
    expect(errores.area_usuario).toBeDefined()
    expect(errores.rol_usuario).toBeDefined()
    expect(errores.contrasena).toBeDefined()
  })

  it('rechaza un correo con formato inválido', () => {
    expect(validarCorreo('ana.perez')).toContain('correo válido')
    expect(validarCorreo('ana@innovatech')).toContain('correo válido')
    expect(validarCorreo('ana.perez@innovatech.pe')).toBe('')
  })

  it('normaliza el correo con espacios y mayúsculas al validarlo', () => {
    expect(validarCorreo('  Ana.Perez@Innovatech.pe  ')).toBe('')
  })

  it('exige una contraseña con mayúscula, minúscula y número', () => {
    expect(validarContrasena('clave1234')).toContain('mayúscula')
    expect(validarContrasena('CLAVE1234')).toContain('minúscula')
    expect(validarContrasena('ClaveSinNumero')).toContain('número')
    expect(validarContrasena('Ab1')).toContain('entre 8 y 64')
    expect(validarContrasena('Clave1234')).toBe('')
  })

  it('en la edición la contraseña es opcional, pero si llega debe cumplir la regla', () => {
    expect(validarEdicionUsuario({ ...USUARIO_VALIDO, contrasena: '' })).toEqual({})
    expect(validarEdicionUsuario({ ...USUARIO_VALIDO, contrasena: 'debil' }).contrasena).toBeDefined()
  })

  it('el ingreso solo exige correo válido y contraseña', () => {
    expect(validarIngreso({ correo_usuario: '', contrasena: '' })).toEqual({
      correo_usuario: 'El correo es obligatorio.',
      contrasena: 'La contraseña es obligatoria.',
    })
    expect(validarIngreso({ correo_usuario: 'ana@innovatech.pe', contrasena: 'x' })).toEqual({})
  })
})
