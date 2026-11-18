import AccionesDeFormulario from '../ui/AccionesDeFormulario'
import AlertMessage from '../ui/AlertMessage'
import SeccionNumerada from '../ui/SeccionNumerada'
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

      <SeccionNumerada
        id="titulo-identificacion-equipo"
        numero="1"
        titulo="Identificación del equipo"
        descripcion="El código patrimonial está en la etiqueta del equipo y es único en todo TechAsset."
      >
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
      </SeccionNumerada>

      <SeccionNumerada
        id="titulo-clasificacion-equipo"
        numero="2"
        titulo="Clasificación y disponibilidad"
        descripcion="La categoría ordena el inventario. El estado Prestado lo asigna el sistema con el préstamo."
      >
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
      </SeccionNumerada>

      <AccionesDeFormulario
        faltanDatos={faltanDatos}
        enviando={enviando}
        textoEnviar={esNuevo ? 'Registrar equipo' : 'Guardar cambios'}
        textoCargando={esNuevo ? 'Registrando…' : 'Guardando…'}
        onCancelar={onCancelar}
      />
    </form>
  )
}
