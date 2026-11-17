import AlertMessage from '../ui/AlertMessage'
import Button from '../ui/Button'
import SelectInput from '../ui/SelectInput'
import TextInput from '../ui/TextInput'
import { CATEGORIAS_EQUIPO, ESTADOS_INICIALES_EQUIPO, etiquetaDeEstadoEquipo } from '../../reglas/catalogos'

// Formulario de registro y edición de equipos (RF-05, RF-06). Dos tarjetas numeradas: identificación
// y clasificación. El estado solo se elige al registrar; después se cambia desde el detalle (RF-08).
export default function FormularioEquipo({
  esNuevo = true,
  valores,
  errores,
  mensaje,
  enviando,
  faltanDatos,
  cambiar,
  salirDelCampo,
  enviar,
  onCancelar,
}) {
  return (
    <form noValidate onSubmit={enviar} className="space-y-6">
      {mensaje && <AlertMessage tipo={mensaje.tipo}>{mensaje.texto}</AlertMessage>}

      <section
        aria-labelledby="titulo-identificacion-equipo"
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
            <h2 id="titulo-identificacion-equipo" className="text-base font-bold text-titulo">
              Identificación del equipo
            </h2>
            <p className="mt-0.5 text-sm text-texto-suave">
              El código patrimonial está en la etiqueta del equipo y es único en todo TechAsset.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextInput
              label="Código patrimonial"
              name="codigo_patrimonial_equipo"
              value={valores.codigo_patrimonial_equipo}
              onChange={cambiar}
              onBlur={salirDelCampo}
              error={errores.codigo_patrimonial_equipo}
              ayuda="Por ejemplo, TK-2026-0001. Se guarda en mayúsculas y no puede repetirse (RN-07)."
              autoComplete="off"
              spellCheck="false"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <TextInput
              label="Nombre del equipo"
              name="nombre_equipo"
              value={valores.nombre_equipo}
              onChange={cambiar}
              onBlur={salirDelCampo}
              error={errores.nombre_equipo}
              ayuda="Marca y modelo que permitan reconocerlo, por ejemplo «Laptop Dell Latitude 5440»."
              required
            />
          </div>
          <div className="sm:col-span-2">
            <TextInput
              label="Marca"
              name="marca_equipo"
              value={valores.marca_equipo}
              onChange={cambiar}
              onBlur={salirDelCampo}
              error={errores.marca_equipo}
              ayuda="Fabricante del equipo, por ejemplo Dell, HP, Epson o Cisco."
              required
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="titulo-clasificacion-equipo"
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
            <h2 id="titulo-clasificacion-equipo" className="text-base font-bold text-titulo">
              Clasificación y disponibilidad
            </h2>
            <p className="mt-0.5 text-sm text-texto-suave">
              La categoría ordena el inventario. El estado Prestado lo asigna el sistema con el préstamo.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="Categoría"
            name="categoria_equipo"
            value={valores.categoria_equipo}
            onChange={cambiar}
            onBlur={salirDelCampo}
            error={errores.categoria_equipo}
            opciones={CATEGORIAS_EQUIPO}
            placeholder="Seleccione una categoría"
            ayuda="Catálogo del caso: siete categorías (D-08)."
            required
          />

          {esNuevo ? (
            <SelectInput
              label="Estado inicial"
              name="estado_equipo"
              value={valores.estado_equipo}
              onChange={cambiar}
              onBlur={salirDelCampo}
              error={errores.estado_equipo}
              opciones={ESTADOS_INICIALES_EQUIPO}
              placeholder="Seleccione el estado inicial"
              ayuda="Disponible, Mantenimiento o Baja. Un equipo prestado no se registra a mano."
              required
            />
          ) : (
            <div className="rounded-lg border border-borde bg-superficie-tenue px-3 py-2.5">
              <p className="text-xs font-semibold tracking-wide text-texto-suave uppercase">
                Estado actual
              </p>
              <p className="mt-1 text-sm font-semibold text-texto">
                {etiquetaDeEstadoEquipo(valores.estado_equipo)}
              </p>
              <p className="mt-1 text-xs text-texto-suave">
                El estado se cambia con la acción de estado, no al editar los datos.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-texto-suave">
          {faltanDatos
            ? 'Complete los campos obligatorios para guardar.'
            : 'Todos los datos obligatorios están completos.'}
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variante="secundario" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </Button>
          <Button
            tipo="submit"
            cargando={enviando}
            textoCargando={esNuevo ? 'Registrando…' : 'Guardando…'}
            disabled={faltanDatos}
          >
            {esNuevo ? 'Registrar equipo' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </form>
  )
}
