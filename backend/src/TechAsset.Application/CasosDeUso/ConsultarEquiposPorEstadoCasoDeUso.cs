using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;

namespace TechAsset.Application.CasosDeUso;

// RF-14: equipos por estado con sus filtros de categoría, marca y texto.
public sealed class ConsultarEquiposPorEstadoCasoDeUso(
    IConsultaDeEquiposPorEstado consultaDeEquiposPorEstado)
{
    public Task<ReporteDeEquiposPorEstado> EjecutarAsync(
        FiltroDeEquiposPorEstado filtro,
        CancellationToken cancellationToken = default) =>
        consultaDeEquiposPorEstado.ObtenerAsync(filtro, cancellationToken);
}
