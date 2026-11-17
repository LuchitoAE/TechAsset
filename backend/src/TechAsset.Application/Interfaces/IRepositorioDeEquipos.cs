using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;

namespace TechAsset.Application.Interfaces;

// Contrato de escritura de equipos. La implementación vive en Infrastructure (patrón Repository).
public interface IRepositorioDeEquipos
{
    Task<Equipo?> ObtenerPorIdAsync(Guid idEquipo, CancellationToken cancellationToken = default);

    Task<bool> ExisteCodigoAsync(
        CodigoPatrimonial codigoPatrimonial,
        Guid? exceptoIdEquipo,
        CancellationToken cancellationToken = default);

    Task AgregarAsync(Equipo equipo, CancellationToken cancellationToken = default);

    Task GuardarCambiosAsync(CancellationToken cancellationToken = default);
}
