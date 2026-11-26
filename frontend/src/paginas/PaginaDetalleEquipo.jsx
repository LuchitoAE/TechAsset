import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { actualizarEquipo, cambiarEstadoEquipo, obtenerEquipo } from '../api/equiposApi'
import { listarPrestamos } from '../api/prestamosApi'
import { listarMovimientos } from '../api/reportesApi'
import AlertMessage from '../components/ui/AlertMessage'
import Button from '../components/ui/Button'
import Cargando from '../components/ui/Cargando'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import ModalConfirmacion from '../components/ui/ModalConfirmacion'
import EtiquetaDeEstadoEquipo from '../components/equipos/EtiquetaDeEstadoEquipo'
import FormularioEquipo from '../components/equipos/FormularioEquipo'
import IconoDeMenu from '../components/navegacion/IconoDeMenu'
import { useAvisos } from '../contextos/contextoDeAvisos'
import { useSesion } from '../contextos/contextoDeSesion'
import { useFormulario } from '../hooks/useFormulario'
import { ETIQUETAS_DE_CAMPO } from '../reglas/campos'
import {
  etiquetaDeCategoria,
  etiquetaDeEstadoEquipo,
  etiquetaDeEstadoPrestamo,
} from '../reglas/catalogos'
import { puedeGestionarEquipos } from '../reglas/permisos'
import { etiquetaDeTipoMovimiento, formatearFechaYHora } from '../reglas/reportes'
import { formatearFecha } from '../utils/fechas'
import {
  estadosDisponiblesPara,
  normalizarCodigoPatrimonial,
  puedeCambiarEstado,
  validarEdicionEquipo,
} from '../reglas/validacionEquipos'

const MENSAJES_DE_ESTADO = {
  Disponible:
    'El equipo volverá a estar disponible para préstamos. Podrá solicitarse de nuevo cuando alguien lo necesite.',
  Mantenimiento:
    'El equipo quedará fuera de servicio y no podrá prestarse hasta que vuelva a estar disponible.',
  Baja: 'El equipo dejará de estar disponible para préstamos. Podrá reincorporarlo cambiando su estado más adelante.',
}

const COLOR_DE_ESTADO = {
  Solicitado: 'bg-aviso-vivo',
  Activo: 'bg-marca-600',
  Devuelto: 'bg-exito-vivo',
  Rechazado: 'bg-error-vivo',
}

const COLOR_DE_MOVIMIENTO = {
  EquipoRegistrado: 'bg-exito-vivo',
  EquipoActualizado: 'bg-marca-600',
  EquipoEstadoCambiado: 'bg-info-vivo',
  PrestamoSolicitado: 'bg-aviso-vivo',
  PrestamoAprobado: 'bg-marca-600',
  PrestamoRechazado: 'bg-error-vivo',
  PrestamoDevuelto: 'bg-exito-vivo',
}

// RF-06 y RF-08: detalle del equipo con su resumen, sus préstamos y la línea de movimientos. El
// Administrador y el Responsable editan los datos y cambian el estado con confirmación.
export default function PaginaDetalleEquipo() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { sesion } = useSesion()
  const { mostrarAviso, mostrarError } = useAvisos()
  const puedeGestionar = puedeGestionarEquipos(sesion?.rol_usuario)

  const [equipo, setEquipo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [editando, setEditando] = useState(false)
  const [mostrarEstados, setMostrarEstados] = useState(false)
  const [estadoObjetivo, setEstadoObjetivo] = useState(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

  const [prestamos, setPrestamos] = useState([])
  const [movimientos, setMovimientos] = useState([])

  const formulario = useFormulario({
    valoresIniciales: {
      codigo_patrimonial_equipo: '',
      nombre_equipo: '',
      categoria_equipo: '',
      marca_equipo: '',
      estado_equipo: '',
    },
    validar: validarEdicionEquipo,
    camposObligatorios: [
      'codigo_patrimonial_equipo',
      'nombre_equipo',
      'categoria_equipo',
      'marca_equipo',
    ],
    etiquetas: ETIQUETAS_DE_CAMPO,
    alEnviar: async (valores) => {
      const datos = await actualizarEquipo(equipo.id_equipo, {
        codigo_patrimonial_equipo: normalizarCodigoPatrimonial(valores.codigo_patrimonial_equipo),
        nombre_equipo: valores.nombre_equipo,
        categoria_equipo: valores.categoria_equipo,
        marca_equipo: valores.marca_equipo,
      })

      setEquipo(datos)
      formulario.establecerValores(datos)
      setEditando(false)
      mostrarAviso('Los cambios se guardaron.')
    },
  })

  const establecerValoresDelFormulario = formulario.establecerValores

  useEffect(() => {
    let vigente = true

    obtenerEquipo(id)
      .then((datos) => {
        if (!vigente) return
        setEquipo(datos)
        setError(null)
        establecerValoresDelFormulario(datos)
      })
      .catch((excepcion) => {
        if (vigente) setError(excepcion.message)
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [establecerValoresDelFormulario, id])

  useEffect(() => {
    if (!equipo) return undefined

    const control = new AbortController()

    listarPrestamos({ id_equipo: id, pagina: 1, tamano: 3 }, control.signal)
      .then((datos) => {
        if (!control.signal.aborted) setPrestamos(datos.prestamos ?? [])
      })
      .catch(() => {})

    listarMovimientos({ equipo: equipo.nombre_equipo, pagina: 1, tamano: 4 }, control.signal)
      .then((datos) => {
        if (!control.signal.aborted) setMovimientos(datos.movimientos ?? [])
      })
      .catch(() => {})

    return () => control.abort()
  }, [equipo, id])

  async function confirmarCambioDeEstado() {
    if (!estadoObjetivo) return

    setCambiandoEstado(true)
    setError(null)

    try {
      const datos = await cambiarEstadoEquipo(equipo.id_equipo, estadoObjetivo)
      setEquipo(datos)
      formulario.establecerValores({
        ...formulario.valores,
        estado_equipo: datos.estado_equipo,
        disponible_equipo: datos.disponible_equipo,
      })
      mostrarAviso(`El equipo quedó en estado ${etiquetaDeEstadoEquipo(datos.estado_equipo)}.`)
      setEstadoObjetivo(null)
      setMostrarEstados(false)
    } catch (excepcion) {
      setError(excepcion.message)
      mostrarError(excepcion.message)
      setEstadoObjetivo(null)
    } finally {
      setCambiandoEstado(false)
    }
  }

  if (cargando) {
    return <Cargando texto="Consultando el equipo…" />
  }

  if (!equipo) {
    return (
      <div className="space-y-4">
        <AlertMessage tipo="error">{error ?? 'No se encontró el equipo.'}</AlertMessage>
        <Link to="/equipos" className="text-sm font-semibold text-marca-700">
          ← Volver al inventario
        </Link>
      </div>
    )
  }

  const cambioPermitido = puedeCambiarEstado(equipo)
  const estadosPosibles = estadosDisponiblesPara(equipo)
  const prestamoActivo = prestamos.find((prestamo) => prestamo.estado_prestamo === 'Activo')
  const ultimoMovimiento = movimientos[0]

  return (
    <div className="space-y-4">
      <EncabezadoDePagina
        titulo={equipo.nombre_equipo}
        acciones={
          puedeGestionar ? (
            <>
              <Button variante="secundario" onClick={() => setEditando((valor) => !valor)}>
                {editando ? 'Cerrar edición' : 'Editar'}
              </Button>
              <Button
                onClick={() => setMostrarEstados((valor) => !valor)}
                aria-expanded={mostrarEstados}
                aria-controls="panel-estados"
              >
                Cambiar estado
              </Button>
            </>
          ) : null
        }
      />

      {error && <AlertMessage tipo="error">{error}</AlertMessage>}

      <section
        aria-labelledby="titulo-resumen"
        className="rounded-[16px] border border-borde bg-superficie p-5 sm:p-6"
      >
        <h2 id="titulo-resumen" className="sr-only">
          Resumen del equipo
        </h2>

        <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start lg:gap-10">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="grid size-[72px] shrink-0 place-items-center rounded-[14px] bg-marca-50 text-marca-700"
            >
              <IconoDeMenu nombre="equipos" className="size-8" />
            </span>
            <div className="space-y-2">
              <EtiquetaDeEstadoEquipo estado={equipo.estado_equipo} />
              <span className="block w-fit rounded-full bg-encabezado-tabla px-3 py-1 text-[13px] font-semibold text-texto-suave">
                {etiquetaDeCategoria(equipo.categoria_equipo)}
              </span>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <dt className="text-xs font-semibold text-texto-suave">Código patrimonial</dt>
              <dd className="mt-1 font-mono text-lg font-bold text-titulo">
                {equipo.codigo_patrimonial_equipo}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-texto-suave">Marca</dt>
              <dd className="mt-1 text-lg font-bold text-titulo">{equipo.marca_equipo}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-texto-suave">Responsable</dt>
              <dd className="mt-1 text-lg font-bold text-titulo">
                {prestamoActivo?.nombre_responsable ?? 'Sin préstamo activo'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-texto-suave">Último movimiento</dt>
              <dd className="mt-1 text-lg font-bold text-titulo">
                {ultimoMovimiento
                  ? `${etiquetaDeTipoMovimiento(ultimoMovimiento.tipo_movimiento)} · ${formatearFechaYHora(
                      ultimoMovimiento.fecha_movimiento,
                    )}`
                  : 'Sin movimientos'}
              </dd>
            </div>
          </dl>
        </div>

        <p className="mt-6 text-xs text-texto-suave">
          {equipo.disponible_equipo
            ? 'Disponible para préstamo.'
            : 'No disponible para préstamo mientras esté prestado o fuera de servicio.'}
        </p>
      </section>

      {puedeGestionar && mostrarEstados && (
        <section
          id="panel-estados"
          aria-labelledby="titulo-estado-equipo"
          className="rounded-[16px] border border-borde bg-superficie p-5"
        >
          <h2 id="titulo-estado-equipo" className="text-base font-bold text-titulo">
            Cambiar el estado del equipo
          </h2>
          <p className="mt-1 text-sm text-texto-suave">
            Los estados manuales son Disponible, Mantenimiento y Baja. El estado Prestado lo pone el
            sistema con el préstamo y se retira con la devolución.
          </p>

          {!cambioPermitido ? (
            <p className="mt-4 rounded-lg bg-aviso-fondo px-3 py-2 text-sm text-aviso">
              Este equipo está prestado. Registre primero la devolución para poder cambiar su estado.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">
              {estadosPosibles.map((estado) => (
                <Button
                  key={estado.valor}
                  variante={estado.valor === 'Baja' ? 'peligro' : 'secundario'}
                  onClick={() => setEstadoObjetivo(estado.valor)}
                >
                  Pasar a {estado.etiqueta}
                </Button>
              ))}
            </div>
          )}
        </section>
      )}

      {editando && puedeGestionar && (
        <FormularioEquipo
          esNuevo={false}
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
          onCancelar={() => {
            formulario.establecerValores(equipo)
            setEditando(false)
            navegar('/equipos')
          }}
        />
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_456px]">
        <section
          aria-labelledby="titulo-prestamos-equipo"
          className="rounded-[16px] border border-borde bg-superficie p-5"
        >
          <h2 id="titulo-prestamos-equipo" className="text-[17px] font-bold text-titulo">
            Préstamos de este equipo
          </h2>

          {prestamos.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-borde px-4 py-5 text-center text-sm text-texto-suave">
              Este equipo todavía no tiene préstamos registrados.
            </p>
          ) : (
            <table className="mt-4 w-full text-left text-sm">
              <caption className="sr-only">Últimos préstamos del equipo</caption>
              <thead>
                <tr className="text-[11px] font-semibold tracking-wide text-texto-suave uppercase">
                  <th scope="col" className="pb-2 font-semibold">
                    Fecha
                  </th>
                  <th scope="col" className="pb-2 font-semibold">
                    Colaborador
                  </th>
                  <th scope="col" className="pb-2 font-semibold">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {prestamos.map((prestamo) => (
                  <tr
                    key={prestamo.id_prestamo}
                    className="border-t border-borde transition-colors hover:bg-superficie-tenue"
                  >
                    <td className="py-3 pr-2">
                      <Link
                        to={`/prestamos/${prestamo.id_prestamo}`}
                        className="font-semibold text-titulo hover:underline"
                      >
                        {prestamo.fecha_prestamo
                          ? formatearFecha(prestamo.fecha_prestamo)
                          : 'Por aprobar'}
                      </Link>
                    </td>
                    <td className="py-3 pr-2 text-texto-suave">{prestamo.nombre_responsable}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-titulo">
                        <span
                          aria-hidden="true"
                          className={`size-2 shrink-0 rounded-full ${
                            COLOR_DE_ESTADO[prestamo.estado_prestamo] ?? 'bg-texto-suave'
                          }`}
                        />
                        {etiquetaDeEstadoPrestamo(prestamo.estado_prestamo)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p className="mt-4 text-xs text-texto-suave">
            El equipo no se elimina mientras tenga historial de préstamos; en su lugar se da de baja.
          </p>
        </section>

        <section
          aria-labelledby="titulo-movimientos-equipo"
          className="rounded-[16px] border border-borde bg-superficie p-5"
        >
          <h2 id="titulo-movimientos-equipo" className="text-[17px] font-bold text-titulo">
            Movimientos recientes
          </h2>

          {movimientos.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-borde px-4 py-5 text-center text-sm text-texto-suave">
              Todavía no hay movimientos registrados.
            </p>
          ) : (
            <ol className="mt-4 space-y-0">
              {movimientos.map((movimiento, indice) => (
                <li key={movimiento.id_movimiento} className="relative flex gap-4 pb-5 last:pb-0">
                  {indice < movimientos.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute top-4 left-[6px] h-full w-0.5 bg-borde"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={`relative mt-1 size-3.5 shrink-0 rounded-full ${
                      COLOR_DE_MOVIMIENTO[movimiento.tipo_movimiento] ?? 'bg-texto-suave'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="text-sm font-semibold text-titulo">
                        {etiquetaDeTipoMovimiento(movimiento.tipo_movimiento)}
                      </p>
                      <p className="text-xs text-texto-suave">
                        {formatearFechaYHora(movimiento.fecha_movimiento)}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-texto-suave">
                      {movimiento.detalle_movimiento}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-borde bg-superficie px-5 py-4">
        <p className="max-w-xl text-sm text-texto-suave">
          ¿Necesita ayuda? Consulte el manual del responsable o escriba a soporte de Tecnología.
        </p>
        {puedeGestionar && cambioPermitido && (
          <Button variante="peligro" onClick={() => setEstadoObjetivo('Baja')}>
            Dar de baja
          </Button>
        )}
      </section>

      <ModalConfirmacion
        abierto={estadoObjetivo !== null}
        titulo={`Cambiar estado a ${etiquetaDeEstadoEquipo(estadoObjetivo)}`}
        mensaje={`${equipo.nombre_equipo} (${equipo.codigo_patrimonial_equipo}): ${
          MENSAJES_DE_ESTADO[estadoObjetivo] ?? 'El estado del equipo cambiará.'
        }`}
        textoConfirmar="Cambiar estado"
        peligro={estadoObjetivo === 'Baja'}
        cargando={cambiandoEstado}
        onConfirmar={confirmarCambioDeEstado}
        onCancelar={() => setEstadoObjetivo(null)}
      />
    </div>
  )
}
