import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { listarEquipos } from '../api/equiposApi'
import { listarPrestamos, solicitarPrestamo } from '../api/prestamosApi'
import AlertMessage from '../components/ui/AlertMessage'
import Button from '../components/ui/Button'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import EtiquetaDeEstadoPrestamo from '../components/prestamos/EtiquetaDeEstadoPrestamo'
import FormularioPrestamo from '../components/prestamos/FormularioPrestamo'
import { useAvisos } from '../contextos/contextoDeAvisos'
import { useSesion } from '../contextos/contextoDeSesion'
import { useFormulario } from '../hooks/useFormulario'
import { ETIQUETAS_DE_CAMPO } from '../reglas/campos'
import { fechaDeHoyEnLima, validarSolicitudPrestamo } from '../reglas/prestamos'
import { formatearFecha, sumarDias } from '../utils/fechas'

const HISTORIAL_VACIO = []

// RF-09 y D-04: el Colaborador solicita un equipo disponible. La solicitud queda pendiente hasta
// que el Responsable de Tecnología la apruebe; el responsable es el colaborador de la sesión
// (RN-05).
export default function PaginaNuevoPrestamo() {
  const { sesion } = useSesion()
  const navegar = useNavigate()
  const { mostrarAviso } = useAvisos()
  const [parametros] = useSearchParams()

  const [equipos, setEquipos] = useState([])
  const [cargandoEquipos, setCargandoEquipos] = useState(true)
  const [errorEquipos, setErrorEquipos] = useState(null)
  const [intento, setIntento] = useState(0)
  const [historial, setHistorial] = useState(HISTORIAL_VACIO)

  const hoy = fechaDeHoyEnLima()

  const formulario = useFormulario({
    valoresIniciales: {
      id_equipo: parametros.get('equipo') ?? '',
      fecha_devolucion: '',
    },
    validar: (valores) => validarSolicitudPrestamo(valores, { hoy }),
    camposObligatorios: ['id_equipo', 'fecha_devolucion'],
    etiquetas: ETIQUETAS_DE_CAMPO,
    alEnviar: async (valores) => {
      await solicitarPrestamo({
        id_equipo: valores.id_equipo,
        fecha_devolucion: valores.fecha_devolucion,
      })

      navegar('/mis-prestamos', { replace: true })
      mostrarAviso(
        'Solicitud enviada. El Responsable de Tecnología la revisará y el equipo se le asignará al aprobarla.',
      )
    },
  })

  useEffect(() => {
    const control = new AbortController()

    listarEquipos({ estado: 'Disponible', tamano: 100 }, control.signal)
      .then((datos) => {
        if (control.signal.aborted) return
        setEquipos(datos.equipos)
        setErrorEquipos(null)
      })
      .catch((excepcion) => {
        if (excepcion.name !== 'AbortError') setErrorEquipos(excepcion.message)
      })
      .finally(() => {
        if (!control.signal.aborted) setCargandoEquipos(false)
      })

    listarPrestamos({ pagina: 1, tamano: 3 }, control.signal)
      .then((datos) => {
        if (!control.signal.aborted) setHistorial(datos.prestamos ?? [])
      })
      .catch(() => {})

    return () => control.abort()
  }, [intento])

  const responsable = sesion
    ? {
        nombre: `${sesion.nombres_usuario} ${sesion.apellidos_usuario}`.trim(),
        correo: sesion.correo_usuario,
      }
    : null

  const elegido = equipos.find((equipo) => equipo.id_equipo === formulario.valores.id_equipo)

  return (
    <div className="space-y-4">
      <EncabezadoDePagina
        titulo="Solicitar préstamo"
        descripcion="Elija un equipo disponible y la fecha en que lo devolverá. La solicitud queda pendiente hasta la aprobación del Responsable de Tecnología."
      />

      {errorEquipos && (
        <AlertMessage tipo="error">
          No se pudo consultar la disponibilidad: {errorEquipos}{' '}
          <Button
            variante="fantasma"
            onClick={() => {
              setCargandoEquipos(true)
              setIntento((actual) => actual + 1)
            }}
          >
            Reintentar
          </Button>
        </AlertMessage>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <FormularioPrestamo
          valores={formulario.valores}
          errores={formulario.errores}
          mensaje={formulario.mensaje}
          enviando={formulario.enviando}
          faltanDatos={formulario.faltanDatos}
          intentoEnviado={formulario.intentoEnviado}
          anuncio={formulario.anuncio}
          resumenErrores={formulario.resumenErrores}
          cambiar={formulario.cambiar}
          salirDelCampo={formulario.salirDelCampo}
          enviar={formulario.enviar}
          onCancelar={() => navegar('/mis-prestamos')}
          equipos={equipos}
          cargandoEquipos={cargandoEquipos}
          responsable={responsable}
          fechaMinima={sumarDias(hoy, 1)}
        />

        <aside className="space-y-4">
          <section
            aria-labelledby="titulo-disponibilidad"
            className="rounded-[16px] border border-borde bg-superficie p-5"
          >
            <h2 id="titulo-disponibilidad" className="text-[17px] font-bold text-titulo">
              Disponibilidad
            </h2>

            {elegido ? (
              <>
                <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-exito">
                  <span aria-hidden="true">✓</span> Sin cruces
                </p>
                <p className="mt-3 text-[17px] font-bold text-titulo">
                  {formulario.valores.fecha_devolucion
                    ? `Del ${formatearFecha(hoy)} al ${formatearFecha(formulario.valores.fecha_devolucion)}`
                    : 'Elija la fecha de devolución'}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-texto-suave">
                  {elegido.nombre_equipo} está disponible. Si cambia de equipo o de fecha, la
                  disponibilidad se vuelve a consultar.
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-texto-suave">
                Elija un equipo para ver su disponibilidad en el rango de fechas.
              </p>
            )}

            <div className="mt-5 border-t border-borde pt-4">
              <p className="text-xs font-semibold text-texto-suave">Reservas del día</p>
              <p className="mt-1 text-[13px] font-semibold text-titulo">
                {elegido ? 'Sin préstamos activos' : 'Esperando un equipo'}
              </p>
            </div>
          </section>

          <section
            aria-labelledby="titulo-mi-historial"
            className="rounded-[16px] border border-borde bg-superficie p-5"
          >
            <h2 id="titulo-mi-historial" className="text-[17px] font-bold text-titulo">
              Mi historial (últimos)
            </h2>

            {historial.length === 0 ? (
              <p className="mt-4 text-sm text-texto-suave">
                Todavía no tiene préstamos registrados.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {historial.map((prestamo) => (
                  <li key={prestamo.id_prestamo} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-titulo">
                        {prestamo.nombre_equipo}
                      </p>
                      <p className="font-mono text-[11px] text-texto-suave">
                        {prestamo.codigo_patrimonial_equipo}
                      </p>
                    </div>
                    <EtiquetaDeEstadoPrestamo
                      estado={prestamo.estado_prestamo}
                      vencido={prestamo.vencido_prestamo}
                      variante="punto"
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
