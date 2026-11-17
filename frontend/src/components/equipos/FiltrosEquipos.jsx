import Button from '../ui/Button'
import SelectInput from '../ui/SelectInput'
import TextInput from '../ui/TextInput'
import { CATEGORIAS_EQUIPO, ESTADOS_EQUIPO } from '../../reglas/catalogos'

// Filtros de RF-07: texto, estado, categoría y marca. Se envían al pulsar Filtrar.
export default function FiltrosEquipos({ filtros, onCambiar, onFiltrar, onLimpiar, cargando }) {
  return (
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
          placeholder="Código, nombre o marca"
          autoComplete="off"
        />
        <SelectInput
          label="Estado"
          name="estado"
          value={filtros.estado}
          onChange={onCambiar}
          opciones={ESTADOS_EQUIPO}
          placeholder="Todos los estados"
        />
        <SelectInput
          label="Categoría"
          name="categoria"
          value={filtros.categoria}
          onChange={onCambiar}
          opciones={CATEGORIAS_EQUIPO}
          placeholder="Todas las categorías"
        />
        <TextInput
          label="Marca"
          name="marca"
          value={filtros.marca}
          onChange={onCambiar}
          placeholder="Todas las marcas"
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
  )
}
