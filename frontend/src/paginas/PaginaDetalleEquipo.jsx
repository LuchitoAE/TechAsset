import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { actualizarEquipo, cambiarEstadoEquipo, obtenerEquipo } from '../api/equiposApi'
import AlertMessage from '../components/ui/AlertMessage'
import Button from '../components/ui/Button'
import Cargando from '../components/ui/Cargando'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import MigasDePan from '../components/ui/MigasDePan'
import ModalConfirmacion from '../components/ui/ModalConfirmacion'
import EtiquetaDeEstadoEquipo from '../components/equipos/EtiquetaDeEstadoEquipo'
import FormularioEquipo from '../components/equipos/FormularioEquipo'
import { useAvisos } from '../contextos/contextoDeAvisos'
import { useSesion } from '../contextos/contextoDeSesion'
import { useFormulario } from '../hooks/useFormulario'
import { ETIQUETAS_DE_CAMPO } from '../reglas/campos'
import { etiquetaDeCategoria, etiquetaDeEstadoEquipo } from '../reglas/catalogos'
import { puedeGestionarEquipos } from '../reglas/permisos'
import {
  estadosDisponiblesPara,
  normalizarCodigoPatrimonial,
  puedeCambiarEstado,
  validarEdicionEquipo,
} from '../reglas/validacionEquipos'

const MENSAJES_DE_ESTADO = {
  Disponible:
    'El equipo volverá a estar disponible para préstamos. Podrá solicitarse de nuevo desde la iteración 4.',
  Mantenimiento:
    'El equipo quedará fuera de servicio y no podrá prestarse hasta que vuelva a estar disponible.',
  Baja: 'El equipo dejará de estar disponible para préstamos. Podrá reincorporarlo cambiando su estado más adelante.',
}

// RF-06 y RF-08: detalle del equipo. El Administrador y el Responsable editan los datos y cambian el
// estado con confirmación; el Colaborador no entra a esta ruta.
export default function PaginaDetalleEquipo() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { sesion } = useSesion()
  const { mostrarAviso, mostrarError } = useAvisos()
  const puedeGestionar = puedeGestionarEquipos(sesion?.rol_usuario)

  const [equipo, setEquipo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [estadoObjetivo, setEstadoObjetivo] = useState(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

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

  return (
    <div className="space-y-6">
      <MigasDePan
        items={[
          { etiqueta: 'Inicio', ruta: '/' },
          { etiqueta: 'Equipos', ruta: '/equipos' },
          { etiqueta: equipo.nombre_equipo },
        ]}
      />

      <EncabezadoDePagina
        titulo={equipo.nombre_equipo}
        descripcion={`${equipo.codigo_patrimonial_equipo} · ${etiquetaDeCategoria(equipo.categoria_equipo)} · ${equipo.marca_equipo}`}
      >
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <EtiquetaDeEstadoEquipo estado={equipo.estado_equipo} />
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
              equipo.disponible_equipo
                ? 'border-exito/30 bg-exito-fondo text-exito'
                : 'border-borde bg-superficie-tenue text-texto-suave'
            }`}
          >
            {equipo.disponible_equipo ? 'Disponible para préstamo' : 'No disponible para préstamo'}
          </span>
        </div>
      </EncabezadoDePagina>

      {error && <AlertMessage tipo="error">{error}</AlertMessage>}

      {puedeGestionar ? (
        <>
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
            onCancelar={() => navegar('/equipos')}
          />

          <section
            aria-labelledby="titulo-estado-equipo"
            className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta sm:p-6"
          >
            <h2 id="titulo-estado-equipo" className="text-base font-bold text-titulo">
              Estado del equipo
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-texto-suave">
              Los estados disponibles para cambiar a mano son Disponible, Mantenimiento y Baja. El
              estado Prestado lo pone el sistema al registrar un préstamo y se retira con la devolución.
            </p>

            {!cambioPermitido ? (
              <p className="mt-4 rounded-lg bg-aviso-fondo px-3 py-2 text-sm text-aviso">
                Este equipo está prestado. Registre primero la devolución para poder cambiar su estado
                (D-05).
              </p>
            ) : (
              <div className="mt-5 flex flex-wrap gap-3">
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
        </>
      ) : (
        <section className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta sm:p-6">
          <h2 className="text-base font-bold text-titulo">Datos del equipo</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold tracking-wide text-texto-suave uppercase">
                Código patrimonial
              </dt>
              <dd className="mt-1 font-mono text-sm text-texto">{equipo.codigo_patrimonial_equipo}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-texto-suave uppercase">Nombre</dt>
              <dd className="mt-1 text-sm text-texto">{equipo.nombre_equipo}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-texto-suave uppercase">Categoría</dt>
              <dd className="mt-1 text-sm text-texto">{etiquetaDeCategoria(equipo.categoria_equipo)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-texto-suave uppercase">Marca</dt>
              <dd className="mt-1 text-sm text-texto">{equipo.marca_equipo}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-texto-suave uppercase">Estado</dt>
              <dd className="mt-1 text-sm text-texto">{etiquetaDeEstadoEquipo(equipo.estado_equipo)}</dd>
            </div>
          </dl>
          <p className="mt-5 rounded-lg bg-superficie-tenue px-3 py-2 text-xs text-texto-suave">
            Su rol permite consultar el inventario, no modificarlo.
          </p>
        </section>
      )}

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
