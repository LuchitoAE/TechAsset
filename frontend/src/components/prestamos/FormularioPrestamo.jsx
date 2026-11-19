import AccionesDeFormulario from '../ui/AccionesDeFormulario'
import AlertMessage from '../ui/AlertMessage'
import DateInput from '../ui/DateInput'
import ResumenDeErrores from '../ui/ResumenDeErrores'
import SeccionNumerada from '../ui/SeccionNumerada'
import SelectInput from '../ui/SelectInput'
import { etiquetaDeCategoria } from '../../reglas/catalogos'

// Formulario de solicitud de préstamo (RF-09). Dos tarjetas: el equipo y la fecha comprometida; y
// el responsable, que es el colaborador de la sesión (RN-05). El Colaborador no elige el
// responsable: el préstamo queda siempre a su nombre.
export default function FormularioPrestamo({
  valores,
  errores,
  mensaje,
  enviando,
  faltanDatos,
  intentoEnviado = false,
  anuncio = '',
  resumenErrores = [],
  cambiar,
  salirDelCampo,
  enviar,
  onCancelar,
  equipos = [],
  cargandoEquipos = false,
  responsable,
  fechaMinima,
}) {
  const opciones = equipos.map((equipo) => ({
    valor: equipo.id_equipo,
    etiqueta: `${equipo.codigo_patrimonial_equipo} · ${equipo.nombre_equipo} (${
      etiquetaDeCategoria(equipo.categoria_equipo) || equipo.marca_equipo
    })`,
  }))

  return (
    <form
      noValidate
      onSubmit={enviar}
      className="space-y-6"
      aria-label="Formulario de solicitud de préstamo"
    >
      <p className="sr-only" aria-live="polite">
        {anuncio}
      </p>

      {mensaje && <AlertMessage tipo={mensaje.tipo}>{mensaje.texto}</AlertMessage>}

      {intentoEnviado && <ResumenDeErrores errores={resumenErrores} />}

      <p className="text-xs text-texto-suave">
        Los campos con <span aria-hidden="true">*</span> son obligatorios.
      </p>

      <SeccionNumerada
        id="titulo-datos-prestamo"
        numero="1"
        titulo="Equipo y fecha de devolución"
        descripcion="Solo se ofrecen equipos disponibles, sin préstamo activo y fuera de Mantenimiento o Baja."
      >
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <SelectInput
              label="Equipo"
              name="id_equipo"
              value={valores.id_equipo}
              onChange={cambiar}
              onBlur={salirDelCampo}
              error={errores.id_equipo}
              opciones={opciones}
              placeholder={
                cargandoEquipos ? 'Consultando equipos disponibles…' : 'Seleccione un equipo disponible'
              }
              ayuda={
                opciones.length === 0 && !cargandoEquipos
                  ? 'No hay equipos disponibles en este momento. Vuelva a intentarlo más tarde.'
                  : 'El equipo quedará ocupado cuando el Responsable de Tecnología apruebe la solicitud.'
              }
              disabled={cargandoEquipos || opciones.length === 0}
              required
            />
          </div>
          <DateInput
            label="Fecha de devolución comprometida"
            name="fecha_devolucion"
            value={valores.fecha_devolucion}
            onChange={cambiar}
            onBlur={salirDelCampo}
            error={errores.fecha_devolucion}
            min={fechaMinima}
            ayuda="Debe ser posterior a la fecha de préstamo, que será la de la aprobación (RN-04)."
            required
          />
        </div>
      </SeccionNumerada>

      <SeccionNumerada
        id="titulo-responsable-prestamo"
        numero="2"
        titulo="Responsable del préstamo"
        descripcion="Todo préstamo registra un responsable (RN-05). Es usted, el colaborador que solicita."
      >
        <dl className="mt-5 grid gap-4 rounded-lg border border-borde bg-superficie-tenue px-3 py-2.5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold tracking-wide text-texto-suave uppercase">
              Nombre
            </dt>
            <dd className="mt-1 text-sm font-semibold text-texto">
              {responsable?.nombre ?? 'Colaborador de la sesión'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-texto-suave uppercase">
              Correo
            </dt>
            <dd className="mt-1 text-sm text-texto">
              {responsable?.correo ?? 'Se toma de la sesión'}
            </dd>
          </div>
        </dl>
      </SeccionNumerada>

      <AccionesDeFormulario
        faltanDatos={faltanDatos}
        mensajeFaltan="Aún faltan campos obligatorios; se marcarán al enviar la solicitud."
        enviando={enviando}
        textoEnviar="Solicitar préstamo"
        textoCargando="Enviando…"
        onCancelar={onCancelar}
      />
    </form>
  )
}
