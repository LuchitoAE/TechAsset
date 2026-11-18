import AlertMessage from '../ui/AlertMessage'
import Button from '../ui/Button'
import DateInput from '../ui/DateInput'
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
    <form noValidate onSubmit={enviar} className="space-y-6">
      {mensaje && <AlertMessage tipo={mensaje.tipo}>{mensaje.texto}</AlertMessage>}

      <section
        aria-labelledby="titulo-datos-prestamo"
        className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-full bg-marca-50 text-sm font-bold text-marca-700"
          >
            1
          </span>
          <div>
            <h2 id="titulo-datos-prestamo" className="text-base font-bold text-titulo">
              Equipo y fecha de devolución
            </h2>
            <p className="mt-0.5 text-sm text-texto-suave">
              Solo se ofrecen equipos disponibles, sin préstamo activo y fuera de Mantenimiento o Baja.
            </p>
          </div>
        </div>

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
      </section>

      <section
        aria-labelledby="titulo-responsable-prestamo"
        className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-full bg-marca-50 text-sm font-bold text-marca-700"
          >
            2
          </span>
          <div>
            <h2 id="titulo-responsable-prestamo" className="text-base font-bold text-titulo">
              Responsable del préstamo
            </h2>
            <p className="mt-0.5 text-sm text-texto-suave">
              Todo préstamo registra un responsable (RN-05). Es usted, el colaborador que solicita.
            </p>
          </div>
        </div>

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
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-texto-suave">
          {faltanDatos
            ? 'Complete los campos obligatorios para enviar la solicitud.'
            : 'Todos los datos obligatorios están completos.'}
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variante="secundario" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </Button>
          <Button
            tipo="submit"
            cargando={enviando}
            textoCargando="Enviando…"
            disabled={faltanDatos}
          >
            Solicitar préstamo
          </Button>
        </div>
      </div>
    </form>
  )
}
