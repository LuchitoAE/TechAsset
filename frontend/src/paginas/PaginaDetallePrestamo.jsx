import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ErrorDeApi } from '../api/clienteApi'
import { decidirAprobacion, obtenerPrestamo, registrarDevolucion } from '../api/prestamosApi'
import AlertMessage from '../components/ui/AlertMessage'
import Button from '../components/ui/Button'
import Cargando from '../components/ui/Cargando'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import ModalConfirmacion from '../components/ui/ModalConfirmacion'
import TextAreaInput from '../components/ui/TextAreaInput'
import EtiquetaDeEstadoPrestamo from '../components/prestamos/EtiquetaDeEstadoPrestamo'
import { useAvisos } from '../contextos/contextoDeAvisos'
import { useSesion } from '../contextos/contextoDeSesion'
import {
  puedeAprobarse,
  puedeDevolverse,
  validarDevolucion,
  validarRechazo,
} from '../reglas/prestamos'
import { puedeGestionarPrestamos } from '../reglas/permisos'
import { formatearFecha } from '../utils/fechas'

// RF-09, RF-10 y RF-11: detalle del préstamo. El Responsable de Tecnología y el Administrador
// aprueban, rechazan o devuelven; el Colaborador consulta su préstamo. La devolución exige
// observaciones (RN-10) y el rechazo, su motivo.
export default function PaginaDetallePrestamo() {
  const { id } = useParams()
  const { sesion } = useSesion()
  const { mostrarAviso, mostrarError } = useAvisos()
  const gestiona = puedeGestionarPrestamos(sesion?.rol_usuario)

  const [prestamo, setPrestamo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [observacion, setObservacion] = useState('')
  const [errorObservacion, setErrorObservacion] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [errorMotivo, setErrorMotivo] = useState(null)

  const [confirmacion, setConfirmacion] = useState(null)
  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    const control = new AbortController()

    obtenerPrestamo(id, control.signal)
      .then((datos) => {
        if (control.signal.aborted) return
        setPrestamo(datos)
        setError(null)
      })
      .catch((excepcion) => {
        if (excepcion.name !== 'AbortError') setError(excepcion.message)
      })
      .finally(() => {
        if (!control.signal.aborted) setCargando(false)
      })

    return () => control.abort()
  }, [id])

  function pedirAprobacion() {
    setError(null)
    setConfirmacion({
      tipo: 'aprobar',
      titulo: 'Aprobar el préstamo',
      mensaje: `${prestamo.nombre_equipo} quedará prestado a ${prestamo.nombre_responsable} desde hoy y hasta el ${formatearFecha(prestamo.fecha_devolucion)}.`,
      textoConfirmar: 'Aprobar préstamo',
    })
  }

  function pedirRechazo(evento) {
    evento?.preventDefault()

    const errores = validarRechazo({ motivo_rechazo_prestamo: motivo })
    if (errores.motivo_rechazo_prestamo) {
      setErrorMotivo(errores.motivo_rechazo_prestamo)
      document.querySelector('[name="motivo_rechazo_prestamo"]')?.focus()
      return
    }

    setErrorMotivo(null)
    setError(null)
    setConfirmacion({
      tipo: 'rechazar',
      titulo: 'Rechazar la solicitud',
      mensaje: 'La solicitud quedará rechazada y el equipo seguirá disponible para otros colaboradores.',
      textoConfirmar: 'Rechazar solicitud',
    })
  }

  async function confirmarDecision() {
    if (!confirmacion) return

    setProcesando(true)
    setError(null)

    try {
      const datos = await decidirAprobacion(prestamo.id_prestamo, {
        aprobado: confirmacion.tipo === 'aprobar',
        motivoRechazo: confirmacion.tipo === 'rechazar' ? motivo : undefined,
      })

      setPrestamo(datos)
      mostrarAviso(
        confirmacion.tipo === 'aprobar'
          ? 'Préstamo aprobado. El equipo quedó en estado Prestado.'
          : 'Solicitud rechazada. El equipo sigue disponible.',
      )
      if (confirmacion.tipo === 'rechazar') setMotivo('')
      setConfirmacion(null)
    } catch (excepcion) {
      if (excepcion instanceof ErrorDeApi) {
        const mensajeCampo = excepcion.mensajeDeCampo('motivo_rechazo_prestamo')
        if (mensajeCampo) setErrorMotivo(mensajeCampo)
      }
      setError(excepcion.message)
      mostrarError(excepcion.message)
      setConfirmacion(null)
    } finally {
      setProcesando(false)
    }
  }

  async function devolver(evento) {
    evento.preventDefault()
    setError(null)

    const errores = validarDevolucion({ observacion_prestamo: observacion })
    if (errores.observacion_prestamo) {
      setErrorObservacion(errores.observacion_prestamo)
      document.querySelector('[name="observacion_prestamo"]')?.focus()
      return
    }

    setErrorObservacion(null)
    setProcesando(true)

    try {
      const datos = await registrarDevolucion(prestamo.id_prestamo, observacion)
      setPrestamo(datos)
      setObservacion('')
      mostrarAviso('Devolución registrada. El equipo volvió a estar disponible.')
    } catch (excepcion) {
      if (excepcion instanceof ErrorDeApi) {
        const mensajeCampo = excepcion.mensajeDeCampo('observacion_prestamo')
        if (mensajeCampo) setErrorObservacion(mensajeCampo)
      }
      setError(excepcion.message)
      mostrarError(excepcion.message)
    } finally {
      setProcesando(false)
    }
  }

  if (cargando) {
    return <Cargando texto="Consultando el préstamo…" />
  }

  if (!prestamo) {
    return (
      <div className="space-y-4">
        <AlertMessage tipo="error">{error ?? 'No se encontró el préstamo.'}</AlertMessage>
        <Link to="/prestamos" className="text-sm font-semibold text-marca-700">
          ← Volver a préstamos
        </Link>
      </div>
    )
  }

  const aprobado = Boolean(prestamo.fecha_prestamo)
  const devuelto = Boolean(prestamo.fecha_devolucion_real)
  const rechazado = prestamo.estado_prestamo === 'Rechazado'
  const revisado = aprobado || rechazado

  return (
    <div className="space-y-4">
      <EncabezadoDePagina
        titulo={`Préstamo de ${prestamo.nombre_equipo}`}
        acciones={
          <EtiquetaDeEstadoPrestamo
            estado={prestamo.estado_prestamo}
            vencido={prestamo.vencido_prestamo}
          />
        }
      />

      {error && <AlertMessage tipo="error">{error}</AlertMessage>}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_456px]">
        <section
          aria-labelledby="titulo-datos-prestamo"
          className="rounded-[16px] border border-borde bg-superficie p-5 sm:p-6"
        >
          <h2 id="titulo-datos-prestamo" className="sr-only">
            Datos del préstamo
          </h2>

          <dl className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold text-texto-suave">Equipo</dt>
              <dd className="mt-1 text-[17px] font-bold text-titulo">{prestamo.nombre_equipo}</dd>
              <dd className="font-mono text-xs text-texto-suave">
                {prestamo.codigo_patrimonial_equipo}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-texto-suave">Colaborador responsable</dt>
              <dd className="mt-1 text-[17px] font-bold text-titulo">{prestamo.nombre_responsable}</dd>
              <dd className="text-xs text-texto-suave">{prestamo.area_responsable}</dd>
            </div>

            {!rechazado && (
              <div>
                <dt className="text-xs font-semibold text-texto-suave">Prestado el</dt>
                <dd className="mt-1 text-[17px] font-bold text-titulo">
                  {aprobado ? formatearFecha(prestamo.fecha_prestamo) : 'Aún no aprobado'}
                </dd>
              </div>
            )}

            <div>
              <dt className="text-xs font-semibold text-texto-suave">Devolución comprometida</dt>
              <dd className="mt-1 text-[17px] font-bold text-titulo">
                {formatearFecha(prestamo.fecha_devolucion)}
              </dd>
            </div>

            {!rechazado && (
              <div>
                <dt className="text-xs font-semibold text-texto-suave">Devolución real</dt>
                <dd className="mt-1 text-[17px] font-bold text-titulo">
                  {devuelto ? formatearFecha(prestamo.fecha_devolucion_real) : 'Pendiente'}
                </dd>
              </div>
            )}
          </dl>

          {prestamo.observacion_prestamo && (
            <div className="mt-5 rounded-xl bg-superficie-tenue px-4 py-3">
              <p className="text-xs font-semibold text-texto-suave">Observaciones de la devolución</p>
              <p className="mt-1 text-sm text-texto">{prestamo.observacion_prestamo}</p>
            </div>
          )}

          {prestamo.motivo_rechazo_prestamo && (
            <div className="mt-5 rounded-xl bg-error-fondo px-4 py-3">
              <p className="text-xs font-semibold text-error">Motivo del rechazo</p>
              <p className="mt-1 text-sm text-error">{prestamo.motivo_rechazo_prestamo}</p>
            </div>
          )}
        </section>

        <section
          aria-labelledby="titulo-ciclo-prestamo"
          className="rounded-[16px] border border-borde bg-superficie p-5 sm:p-6"
        >
          <h2 id="titulo-ciclo-prestamo" className="text-[17px] font-bold text-titulo">
            Ciclo del préstamo
          </h2>

          <ol className="mt-5 space-y-0">
            <li className="relative flex gap-4 pb-6">
              <span aria-hidden="true" className="absolute top-4 left-[5px] h-full w-0.5 bg-borde" />
              <span aria-hidden="true" className="relative mt-1 size-3 shrink-0 rounded-full bg-marca-600" />
              <div>
                <p className="text-[15px] font-semibold text-titulo">Solicitud enviada</p>
                <p className="text-xs text-texto-suave">
                  {revisado ? 'Revisada por Tecnología' : 'Esperando la revisión del responsable'}
                </p>
              </div>
            </li>

            <li className={`relative flex gap-4 ${rechazado ? '' : 'pb-6'}`}>
              {!rechazado && (
                <span aria-hidden="true" className="absolute top-4 left-[5px] h-full w-0.5 bg-borde" />
              )}
              <span
                aria-hidden="true"
                className={`relative mt-1 size-3 shrink-0 rounded-full ${
                  rechazado ? 'bg-error-vivo' : aprobado ? 'bg-exito-vivo' : 'bg-borde-fuerte'
                }`}
              />
              <div>
                <p className={`text-[15px] font-semibold ${revisado ? 'text-titulo' : 'text-texto-suave'}`}>
                  {rechazado ? 'Solicitud rechazada' : 'Aprobación'}
                </p>
                <p className="text-xs text-texto-suave">
                  {rechazado
                    ? 'No se aprobó; el equipo siguió disponible'
                    : aprobado
                      ? formatearFecha(prestamo.fecha_prestamo)
                      : 'Pendiente'}
                </p>
              </div>
            </li>

            {!rechazado && (
              <li className="flex gap-4">
                <span
                  aria-hidden="true"
                  className={`mt-1 size-3 shrink-0 rounded-full ${
                    devuelto ? 'bg-exito-vivo' : 'bg-aviso-vivo'
                  }`}
                />
                <div>
                  <p className={`text-[15px] font-semibold ${devuelto ? 'text-titulo' : 'text-texto-suave'}`}>
                    {devuelto ? 'Devolución registrada' : 'Devolución pendiente'}
                  </p>
                  <p className="text-xs text-texto-suave">
                    {devuelto
                      ? formatearFecha(prestamo.fecha_devolucion_real)
                      : `Esperada antes del ${formatearFecha(prestamo.fecha_devolucion)}`}
                  </p>
                </div>
              </li>
            )}
          </ol>
        </section>
      </div>

      {gestiona && puedeAprobarse(prestamo) && (
        <section
          aria-labelledby="titulo-decision-prestamo"
          className="rounded-[16px] border border-borde bg-superficie p-5 sm:p-6"
        >
          <h2 id="titulo-decision-prestamo" className="text-[17px] font-bold text-titulo">
            Decisión de la solicitud
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-texto-suave">
            Al aprobar, el préstamo queda activo con la fecha de hoy y el equipo pasa a Prestado. Si
            rechaza, registre el motivo y el equipo seguirá disponible.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={pedirAprobacion} disabled={procesando}>
              Aprobar préstamo
            </Button>
          </div>

          <form onSubmit={pedirRechazo} noValidate className="mt-6 space-y-4" aria-label="Rechazar la solicitud">
            <p className="sr-only" aria-live="polite">
              {errorMotivo ?? ''}
            </p>
            <TextAreaInput
              label="Motivo del rechazo"
              name="motivo_rechazo_prestamo"
              value={motivo}
              onChange={(evento) => setMotivo(evento.target.value)}
              error={errorMotivo}
              ayuda="Entre 5 y 500 caracteres. El colaborador verá este motivo en su historial."
              filas={3}
              requerido
            />
            <div className="flex justify-end">
              <Button variante="peligro" tipo="submit" disabled={procesando}>
                Rechazar solicitud
              </Button>
            </div>
          </form>
        </section>
      )}

      {gestiona && puedeDevolverse(prestamo) && (
        <section
          aria-labelledby="titulo-devolucion-prestamo"
          className="rounded-[16px] border border-borde bg-superficie p-5 sm:p-6"
        >
          <h2 id="titulo-devolucion-prestamo" className="text-[17px] font-bold text-titulo">
            Registrar devolución
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-texto-suave">
            La devolución usa la fecha de hoy y exige observaciones sobre el estado en que vuelve el
            equipo. El equipo quedará disponible para un nuevo préstamo.
          </p>

          <form onSubmit={devolver} noValidate className="mt-4 space-y-4" aria-label="Registrar devolución">
            <p className="sr-only" aria-live="polite">
              {errorObservacion ?? ''}
            </p>
            <TextAreaInput
              label="Observaciones de la devolución"
              name="observacion_prestamo"
              value={observacion}
              onChange={(evento) => setObservacion(evento.target.value)}
              error={errorObservacion}
              ayuda="Entre 5 y 500 caracteres. Indique si vuelve completo, con cargador, con golpes o averiado."
              filas={4}
              requerido
            />
            <div className="flex justify-end">
              <Button tipo="submit" cargando={procesando} textoCargando="Registrando…">
                Confirmar devolución
              </Button>
            </div>
          </form>
        </section>
      )}

      {!gestiona && (
        <p className="rounded-xl bg-superficie-tenue px-4 py-3 text-xs text-texto-suave">
          Su rol permite consultar el préstamo. Para aprobarlo, rechazarlo o registrar la devolución,
          diríjase al Responsable de Tecnología.
        </p>
      )}

      <ModalConfirmacion
        abierto={confirmacion !== null}
        titulo={confirmacion?.titulo}
        mensaje={confirmacion?.mensaje}
        textoConfirmar={confirmacion?.textoConfirmar}
        peligro={confirmacion?.tipo === 'rechazar'}
        cargando={procesando}
        onConfirmar={confirmarDecision}
        onCancelar={() => setConfirmacion(null)}
      />
    </div>
  )
}
