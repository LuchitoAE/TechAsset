import { useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { ingresar } from '../api/autenticacionApi'
import AlertMessage from '../components/ui/AlertMessage'
import BotonTema from '../components/ui/BotonTema'
import Button from '../components/ui/Button'
import TextInput from '../components/ui/TextInput'
import { useSesion } from '../contextos/contextoDeSesion'
import { useFormulario } from '../hooks/useFormulario'
import { validarIngreso } from '../reglas/validacionUsuarios'
import { VERSION_DEL_PRODUCTO } from '../reglas/version'

// Pantalla de ingreso (RN-11): correo y contraseña, un solo mensaje si no coinciden y estado de carga.
export default function PaginaIngreso() {
  const { sesion, iniciarSesion } = useSesion()
  const ubicacion = useLocation()
  const [verContrasena, setVerContrasena] = useState(false)

  const formulario = useFormulario({
    valoresIniciales: { correo_usuario: '', contrasena: '' },
    validar: validarIngreso,
    camposObligatorios: ['correo_usuario', 'contrasena'],
    alEnviar: async (valores) => {
      const datos = await ingresar(valores)
      iniciarSesion(datos)
    },
  })

  if (sesion) {
    const destino = ubicacion.state?.desde || '/'
    return <Navigate to={destino} replace />
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-fondo">
      <div className="absolute top-4 right-4 z-10">
        <BotonTema />
      </div>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <section aria-labelledby="titulo-marca" className="hidden lg:block">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-xl bg-marca-700 text-lg font-bold text-sobre-marca shadow-campo"
            >
              TA
            </span>
            <div>
              <p id="titulo-marca" className="text-xl font-bold tracking-tight text-titulo">
                TechAsset
              </p>
              <p className="text-sm text-texto-suave">Inventario y préstamo de equipos</p>
            </div>
          </div>

          <h1 className="mt-10 max-w-xl text-4xl leading-tight font-bold tracking-tight text-titulo">
            Cada equipo, en su lugar y con su responsable.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-texto-suave">
            Ingrese con su correo corporativo para consultar el inventario, solicitar un préstamo o
            administrar las cuentas de Innovatech.
          </p>

          <ul className="mt-8 grid max-w-lg gap-3 text-sm text-texto-suave">
            {[
              'Un inventario único, sin hojas de cálculo duplicadas.',
              'Préstamos con responsable, fechas y devolución registrada.',
              'Cada rol ve solo lo que necesita para su trabajo.',
            ].map((texto) => (
              <li key={texto} className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-exito-fondo text-[10px] font-bold text-exito"
                >
                  ✓
                </span>
                {texto}
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="titulo-ingreso"
          className="mx-auto w-full max-w-md rounded-2xl border border-borde bg-superficie p-6 shadow-tarjeta sm:p-8"
        >
          <div className="flex items-center gap-2.5 lg:hidden">
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-lg bg-marca-700 text-sm font-bold text-sobre-marca"
            >
              TA
            </span>
            <p className="text-lg font-bold text-titulo">TechAsset</p>
          </div>

          <h2 id="titulo-ingreso" className="mt-4 text-2xl font-bold tracking-tight text-titulo lg:mt-0">
            Ingresar
          </h2>
          <p className="mt-1 text-sm text-texto-suave">
            Use el correo y la contraseña que le entregó el Administrador.
          </p>

          <form noValidate onSubmit={formulario.enviar} className="mt-6 space-y-4">
            {formulario.mensaje && (
              <AlertMessage tipo={formulario.mensaje.tipo}>{formulario.mensaje.texto}</AlertMessage>
            )}

            <TextInput
              label="Correo corporativo"
              name="correo_usuario"
              type="email"
              inputMode="email"
              autoComplete="username"
              value={formulario.valores.correo_usuario}
              onChange={formulario.cambiar}
              onBlur={formulario.salirDelCampo}
              error={formulario.errores.correo_usuario}
              requerido
              autoFocus
            />

            <TextInput
              label="Contraseña"
              name="contrasena"
              type={verContrasena ? 'text' : 'password'}
              autoComplete="current-password"
              value={formulario.valores.contrasena}
              onChange={formulario.cambiar}
              onBlur={formulario.salirDelCampo}
              error={formulario.errores.contrasena}
              requerido
              sufijo={
                <button
                  type="button"
                  onClick={() => setVerContrasena((visible) => !visible)}
                  aria-pressed={verContrasena}
                  className="rounded px-2 py-1 text-xs font-semibold text-marca-700 hover:bg-marca-50"
                >
                  {verContrasena ? 'Ocultar' : 'Mostrar'}
                </button>
              }
            />

            <Button
              tipo="submit"
              className="w-full"
              cargando={formulario.enviando}
              textoCargando="Ingresando…"
              disabled={formulario.faltanDatos}
            >
              Ingresar
            </Button>
          </form>

          <p className="mt-6 border-t border-borde pt-4 text-xs leading-relaxed text-texto-suave">
            ¿No tiene acceso? El Administrador de TechAsset crea las cuentas. No existe registro propio ni
            recuperación automática de contraseña.
          </p>
        </section>
      </main>

      <footer className="border-t border-borde bg-superficie">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-texto-suave sm:px-6">
          <p>Universidad Peruana Los Andes · Construcción de Software</p>
          <p>TechAsset · versión {VERSION_DEL_PRODUCTO} · 2026</p>
        </div>
      </footer>
    </div>
  )
}
