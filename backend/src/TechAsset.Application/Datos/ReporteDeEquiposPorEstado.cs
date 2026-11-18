using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Datos;

// Fila del reporte de equipos por estado (RF-14): el estado, cuántos equipos tiene y la lista de esa
// página del reporte. Los cuatro estados siempre llegan, aunque estén en cero.
public sealed record GrupoDeEquiposPorEstado(
    EstadoEquipo EstadoEquipo,
    int Total,
    IReadOnlyList<DatosDeEquipo> Equipos);

// Reporte completo de equipos por estado. El total general es la suma de los cuatro estados.
public sealed record ReporteDeEquiposPorEstado(
    int Total,
    IReadOnlyList<GrupoDeEquiposPorEstado> Estados);
