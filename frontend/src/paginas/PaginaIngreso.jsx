import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { ingresar } from '../api/autenticacionApi'
import MarcaTechAsset from '../components/marca/MarcaTechAsset'
import AlertMessage from '../components/ui/AlertMessage'
import BotonTema from '../components/ui/BotonTema'
import Button from '../components/ui/Button'
import ResumenDeErrores from '../components/ui/ResumenDeErrores'
import TextInput from '../components/ui/TextInput'
import { useSesion } from '../contextos/contextoDeSesion'
import { useFormulario } from '../hooks/useFormulario'
import { ETIQUETAS_DE_CAMPO } from '../reglas/campos'
import { validarIngreso } from '../reglas/validacionUsuarios'
import { useTituloDePagina } from '../utils/titulo'

const ROLES = [
  { nombre: 'Administrador', detalle: 'Usuarios, equipos y reportes' },
  { nombre: 'Responsable de Tecnología', detalle: 'Aprobaciones y devoluciones' },
  { nombre: 'Colaborador', detalle: 'Solicitudes y su historial' },
]

// En un teléfono o una tableta el teclado se abre solo si se enfoca un campo: no conviene adelantarlo.
// En escritorio, el foco inicial ahorra un clic.
function punteroFino() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(pointer: fine)').matches
    : true
}

// Pantalla de ingreso (RN-11): correo y contraseña, un solo mensaje si no coinciden y estado de carga.
// El panel oscuro presenta el producto; la tarjeta conserva la validación y los mensajes accesibles.
export default function PaginaIngreso() {
  const { sesion, iniciarSesion } = useSesion()
  const ubicacion = useLocation()
  const [verContrasena, setVerContrasena] = useState(false)
  const [enfocarCorreo] = useState(punteroFino)
  useTituloDePagina('Ingresar')

  const formulario = useFormulario({
    valoresIniciales: { correo_usuario: '', contrasena: '' },
    validar: validarIngreso,
    camposObligatorios: ['correo_usuario', 'contrasena'],
    etiquetas: ETIQUETAS_DE_CAMPO,
    alEnviar: async (valores) => {
      const datos = await ingresar(valores)
      iniciarSesion(datos)
    },
  })

  if (sesion) {
    const destino = ubicacion.state?.desde || '/panel'
    return <Navigate to={destino} replace />
  }

  return (
    <div className="flex min-h-dvh flex-col bg-fondo lg:flex-row">
      <aside className="fondo-reticula-oscura relative hidden w-[42%] max-w-[600px] shrink-0 flex-col border-r border-white/10 px-12 py-12 lg:flex">
        <MarcaTechAsset alto={40} tema="oscuro" />

        <div className="my-auto max-w-[430px]">
          <p className="text-xs font-bold tracking-[0.08em] text-marca-400 uppercase">
            Innovatech · Gerencia de Tecnología
          </p>
          <p className="mt-5 text-[2.75rem] leading-[1.06] font-bold tracking-tight text-white">
            Sus equipos,
            <br />
            bajo control.
          </p>
          <p className="mt-8 text-lg leading-relaxed text-tinta-suave">
            Ingrese con su correo corporativo para gestionar el inventario y los préstamos de
            Innovatech.
          </p>

          <ul className="mt-10 grid gap-5">
            {ROLES.map(({ nombre, detalle }) => (
              <li key={nombre} className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-1.5 size-2.5 shrink-0 rounded-full bg-marca-400" />
                <span>
                  <span className="block text-[15px] font-bold text-white">{nombre}</span>
                  <span className="block text-[13px] text-tinta-suave">{detalle}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[13px] text-tinta-suave">
          ¿No tiene cuenta? Pídala al administrador de su área.
        </p>
      </aside>

      <main
        id="contenido-principal"
        tabIndex={-1}
        className="relative flex flex-1 items-center justify-center px-4 py-12 focus:outline-none sm:px-6"
      >
        <div className="absolute top-4 right-4 z-10">
          <BotonTema />
        </div>

        <Link
          to="/"
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-texto-suave hover:text-texto sm:left-6"
        >
          <span aria-hidden="true">←</span> Volver al inicio
        </Link>

        <section
          aria-labelledby="titulo-ingreso"
          className="w-full max-w-[432px] rounded-2xl border border-borde bg-superficie p-6 sm:p-8"
        >
          <div className="lg:hidden">
            <MarcaTechAsset alto={36} />
          </div>

          <h1
            id="titulo-ingreso"
            className="mt-8 text-[1.75rem] leading-tight font-bold tracking-tight text-titulo lg:mt-0"
          >
            Ingresar al sistema
          </h1>
          <p className="mt-2 text-[15px] text-texto-suave">Use su correo corporativo y su contraseña.</p>

          <form noValidate onSubmit={formulario.enviar} className="mt-8 space-y-5" aria-label="Ingreso a TechAsset">
            <p className="sr-only" aria-live="polite">
              {formulario.anuncio}
            </p>

            {formulario.mensaje && (
              <AlertMessage tipo={formulario.mensaje.tipo}>{formulario.mensaje.texto}</AlertMessage>
            )}

            {formulario.intentoEnviado && <ResumenDeErrores errores={formulario.resumenErrores} />}

            <p className="text-xs text-texto-suave">
              Los campos con <span aria-hidden="true">*</span> son obligatorios.
            </p>

            <TextInput
              label="Correo corporativo"
              name="correo_usuario"
              type="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="colaborador@innovatech.pe"
              ayuda="El mismo que usa en su cuenta de Innovatech."
              value={formulario.valores.correo_usuario}
              onChange={formulario.cambiar}
              onBlur={formulario.salirDelCampo}
              error={formulario.errores.correo_usuario}
              requerido
              autoFocus={enfocarCorreo}
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
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-marca-700 hover:bg-marca-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
                >
                  {verContrasena ? 'Ocultar' : 'Mostrar'}
                </button>
              }
            />

            <Button
              tipo="submit"
              className="h-12 w-full text-base"
              cargando={formulario.enviando}
              textoCargando="Ingresando…"
            >
              Ingresar
            </Button>
          </form>

          <p className="mt-6 border-t border-borde pt-4 text-center text-xs leading-relaxed text-texto-suave">
            Los intentos fallidos se limitan por seguridad.
          </p>
        </section>
      </main>
    </div>
  )
}
