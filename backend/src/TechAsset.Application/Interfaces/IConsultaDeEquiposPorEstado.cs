using TechAsset.Application.Datos;

namespace TechAsset.Application.Interfaces;

// Contrato de lectura del reporte de equipos por estado (RF-14).
public interface IConsultaDeEquiposPorEstado
{
    Task<ReporteDeEquiposPorEstado> ObtenerAsync(
        FiltroDeEquiposPorEstado filtro,
        CancellationToken cancellationToken = default);
}
