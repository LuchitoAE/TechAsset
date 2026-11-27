using TechAsset.Application.Datos;

namespace TechAsset.Application.Interfaces;

// Contrato de lectura de préstamos: historial con filtros y préstamos activos, sin cargar entidades.
public interface IConsultaDePrestamos
{
    Task<PaginaDePrestamos> ListarAsync(
        FiltroDePrestamos filtro,
        CancellationToken cancellationToken = default);

    Task<PaginaDePrestamos> ListarActivosAsync(
        FiltroDePrestamos filtro,
        CancellationToken cancellationToken = default);

    Task<DetalleDePrestamo?> ObtenerAsync(Guid idPrestamo, CancellationToken cancellationToken = default);
}
