import Button from '../ui/Button'
import SelectInput from '../ui/SelectInput'
import TextInput from '../ui/TextInput'
import { ROLES } from '../../reglas/catalogos'

// Filtros de RF-03: texto, rol, estado y área. Se envían al pulsar Filtrar.
export default function FiltrosUsuarios({ filtros, onCambiar, onFiltrar, onLimpiar, cargando }) {
  return (
    <search aria-label="Filtros de usuarios" className="block">
      <form
        onSubmit={(evento) => {
          evento.preventDefault()
          onFiltrar()
        }}
        className="rounded-2xl border border-borde bg-superficie p-4 shadow-tarjeta sm:p-5"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TextInput
            label="Buscar"
            name="texto"
            value={filtros.texto}
            onChange={onCambiar}
            placeholder="Nombre, apellido o correo"
            autoComplete="off"
          />
          <SelectInput
            label="Rol"
            name="rol"
            value={filtros.rol}
            onChange={onCambiar}
            opciones={ROLES}
            placeholder="Todos los roles"
          />
          <SelectInput
            label="Estado"
            name="activo"
            value={filtros.activo}
            onChange={onCambiar}
            opciones={[
              { valor: 'true', etiqueta: 'Activos' },
              { valor: 'false', etiqueta: 'Deshabilitados' },
            ]}
            placeholder="Todos los estados"
          />
          <TextInput
            label="Área"
            name="area"
            value={filtros.area}
            onChange={onCambiar}
            placeholder="Todas las áreas"
            autoComplete="off"
          />
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <Button variante="fantasma" onClick={onLimpiar} disabled={cargando}>
            Limpiar filtros
          </Button>
          <Button tipo="submit" cargando={cargando} textoCargando="Buscando…">
            Filtrar
          </Button>
        </div>
      </form>
    </search>
  )
}
