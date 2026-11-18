using TechAsset.Application.Datos;

namespace TechAsset.Application.Interfaces;

// Contrato de lectura del reporte de préstamos por área (RF-16).
public interface IConsultaDePrestamosPorArea
{
    Task<ReporteDePrestamosPorArea> ObtenerAsync(
        FiltroDePrestamosPorArea filtro,
        CancellationToken cancellationToken = default);
}
