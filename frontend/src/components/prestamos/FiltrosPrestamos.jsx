import Button from '../ui/Button'
import DateInput from '../ui/DateInput'
import SelectInput from '../ui/SelectInput'
import TextInput from '../ui/TextInput'
import { ESTADOS_PRESTAMO } from '../../reglas/catalogos'

// Filtros de RF-11: texto (equipo o responsable), estado, área del responsable y rango de fechas de
// préstamo. Se envían al pulsar Filtrar.
export default function FiltrosPrestamos({
  filtros,
  onCambiar,
  onFiltrar,
  onLimpiar,
  cargando,
  mostrarArea = true,
}) {
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
          placeholder="Código, equipo o responsable"
          autoComplete="off"
        />
        <SelectInput
          label="Estado del préstamo"
          name="estado"
          value={filtros.estado}
          onChange={onCambiar}
          opciones={ESTADOS_PRESTAMO}
          placeholder="Todos los estados"
        />
        {mostrarArea && (
          <TextInput
            label="Área del responsable"
            name="area"
            value={filtros.area}
            onChange={onCambiar}
            placeholder="Todas las áreas"
            autoComplete="off"
          />
        )}
        <DateInput
          label="Préstamo desde"
          name="desde"
          value={filtros.desde}
          onChange={onCambiar}
        />
        <DateInput
          label="Préstamo hasta"
          name="hasta"
          value={filtros.hasta}
          onChange={onCambiar}
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
