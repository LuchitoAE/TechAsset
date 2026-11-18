using TechAsset.Application.Datos;

namespace TechAsset.Application.Interfaces;

// Contrato de lectura del historial de movimientos (RF-17), con filtros y paginación.
public interface IConsultaDeMovimientos
{
    Task<PaginaDeMovimientos> ListarAsync(
        FiltroDeMovimientos filtro,
        CancellationToken cancellationToken = default);
}
