import MarcaTechAsset from '../marca/MarcaTechAsset'

// Vista previa del panel para el héroe de la landing. Es una ilustración: se oculta a los lectores de
// pantalla y se describe una sola vez en el texto alternativo que la envuelve.
const INDICADORES = [
  { glifo: '▤', valor: '128', etiqueta: 'Equipos', color: 'text-marca-700', fondo: 'bg-marca-50' },
  { glifo: '✓', valor: '96', etiqueta: 'Disponibles', color: 'text-exito', fondo: 'bg-exito-fondo' },
  { glifo: '⇄', valor: '24', etiqueta: 'Prestados', color: 'text-aviso', fondo: 'bg-aviso-fondo' },
]

const FILAS = [
  { codigo: 'TK-9005', equipo: 'Laptop Dell', estado: 'Disponible', color: 'bg-exito-vivo' },
  { codigo: 'TK-9006', equipo: 'Proyector', estado: 'Prestado', color: 'bg-marca-600' },
  { codigo: 'TK-9011', equipo: 'Impresora', estado: 'Mantenimiento', color: 'bg-aviso-vivo' },
]

export default function PanelDeMuestra() {
  return (
    <div className="rounded-3xl border border-borde bg-superficie p-2.5">
      <div className="flex items-center gap-2.5 rounded-2xl bg-tinta px-3.5 py-2.5">
        <MarcaTechAsset alto={26} tema="oscuro" conTexto={false} />
        <span className="text-sm font-bold text-white">TechAsset</span>
        <span className="ml-auto truncate text-[11px] text-tinta-suave">L. Aquino · Administrador</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 px-1 pt-3">
        {INDICADORES.map(({ glifo, valor, etiqueta, color, fondo }) => (
          <div key={etiqueta} className="rounded-xl border border-borde bg-superficie-tenue p-2.5">
            <span
              className={`grid size-7 place-items-center rounded-lg ${fondo} ${color} text-xs font-bold`}
            >
              <span aria-hidden="true">{glifo}</span>
            </span>
            <p className="mt-2 text-xl leading-none font-bold text-titulo">{valor}</p>
            <p className="mt-1 text-[11px] font-semibold text-texto-suave">{etiqueta}</p>
          </div>
        ))}
      </div>

      <div className="px-1 pt-3">
        <div className="grid grid-cols-[1fr_1.15fr_1fr] gap-2 rounded-lg bg-encabezado-tabla px-3 py-1.5 text-[10px] font-semibold tracking-wide text-texto-suave uppercase">
          <span>Código</span>
          <span>Equipo</span>
          <span>Estado</span>
        </div>

        {FILAS.map(({ codigo, equipo, estado, color }) => (
          <div
            key={codigo}
            className="grid grid-cols-[1fr_1.15fr_1fr] items-center gap-2 border-b border-borde px-3 py-2.5 text-[11px] font-semibold text-titulo last:border-0"
          >
            <span>{codigo}</span>
            <span className="truncate">{equipo}</span>
            <span className="flex items-center gap-1.5">
              <span className={`size-1.5 shrink-0 rounded-full ${color}`} aria-hidden="true" />
              <span className="truncate">{estado}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 px-3 py-2.5 text-[10px] text-texto-suave">
        <span>Actualizado hace 2 minutos · 12 movimientos</span>
        <span className="font-semibold text-marca-700">Ver inventario</span>
      </div>
    </div>
  )
}
