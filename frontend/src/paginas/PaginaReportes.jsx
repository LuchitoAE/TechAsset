import { useRef } from 'react'
import { useSearchParams } from 'react-router'
import EncabezadoDePagina from '../components/ui/EncabezadoDePagina'
import ReporteEquiposMasUtilizados from '../components/reportes/ReporteEquiposMasUtilizados'
import ReporteEquiposPorEstado from '../components/reportes/ReporteEquiposPorEstado'
import ReporteMovimientos from '../components/reportes/ReporteMovimientos'
import ReportePrestamosPorArea from '../components/reportes/ReportePrestamosPorArea'

const REPORTES = [
  {
    id: 'estados',
    etiqueta: 'Equipos por estado',
    descripcion: 'Cuántos equipos hay en cada estado y cuáles son.',
    Componente: ReporteEquiposPorEstado,
  },
  {
    id: 'utilizados',
    etiqueta: 'Más utilizados',
    descripcion: 'Ranking por cantidad de préstamos y áreas que más los usaron.',
    Componente: ReporteEquiposMasUtilizados,
  },
  {
    id: 'areas',
    etiqueta: 'Préstamos por área',
    descripcion: 'Uso por área del responsable en el periodo consultado.',
    Componente: ReportePrestamosPorArea,
  },
  {
    id: 'movimientos',
    etiqueta: 'Movimientos',
    descripcion: 'Historial de altas, cambios de estado y decisiones de préstamo.',
    Componente: ReporteMovimientos,
  },
]

// RF-14 a RF-17: una sola pantalla con cuatro pestañas. Cada panel consulta la API cuando se abre y
// tiene sus propios filtros, estados vacíos y errores. El teclado recorre las pestañas con las
// flechas, Inicio y Fin.
export default function PaginaReportes() {
  const [parametros, setParametros] = useSearchParams()
  const botones = useRef([])

  // La pestaña vive en la URL: recargar o compartir el enlace mantiene el reporte abierto.
  const solicitado = parametros.get('reporte')
  const activo = REPORTES.some((reporte) => reporte.id === solicitado) ? solicitado : REPORTES[0].id
  const actual = REPORTES.find((reporte) => reporte.id === activo) ?? REPORTES[0]
  const Componente = actual.Componente

  function cambiarReporte(id) {
    setParametros({ reporte: id }, { replace: true })
  }

  function seleccionar(indice) {
    const reporte = REPORTES[indice]
    if (!reporte) return
    cambiarReporte(reporte.id)
    botones.current[indice]?.focus()
  }

  function alPresionarTecla(evento, indice) {
    const total = REPORTES.length

    if (evento.key === 'ArrowRight') {
      evento.preventDefault()
      seleccionar((indice + 1) % total)
    } else if (evento.key === 'ArrowLeft') {
      evento.preventDefault()
      seleccionar((indice - 1 + total) % total)
    } else if (evento.key === 'Home') {
      evento.preventDefault()
      seleccionar(0)
    } else if (evento.key === 'End') {
      evento.preventDefault()
      seleccionar(total - 1)
    }
  }

  return (
    <div className="space-y-6">
      <EncabezadoDePagina
        titulo="Reportes"
        descripcion="Salidas del inventario y de los préstamos. Cuentan los préstamos activos y devueltos; las fechas se muestran en la zona de Lima."
      />

      <div>
        <div
          role="tablist"
          aria-label="Reportes disponibles"
          className="flex flex-wrap gap-1 border-b border-borde"
        >
          {REPORTES.map((reporte, indice) => {
            const seleccionado = reporte.id === activo

            return (
              <button
                key={reporte.id}
                ref={(elemento) => {
                  botones.current[indice] = elemento
                }}
                type="button"
                role="tab"
                id={`tab-${reporte.id}`}
                aria-selected={seleccionado}
                aria-controls={`panel-${reporte.id}`}
                tabIndex={seleccionado ? 0 : -1}
                onClick={() => cambiarReporte(reporte.id)}
                onKeyDown={(evento) => alPresionarTecla(evento, indice)}
                className={`-mb-px inline-flex min-h-11 items-center border-b-2 px-4 text-sm transition-colors ${
                  seleccionado
                    ? 'border-marca-600 font-bold text-marca-700'
                    : 'border-transparent font-normal text-texto-suave hover:text-texto'
                }`}
              >
                {reporte.etiqueta}
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`panel-${actual.id}`}
          aria-labelledby={`tab-${actual.id}`}
          tabIndex={0}
          className="space-y-4 pt-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        >
          <h2 className="sr-only">{actual.etiqueta}</h2>
          <p className="text-sm text-texto-suave">{actual.descripcion}</p>
          <Componente />
        </div>
      </div>
    </div>
  )
}
