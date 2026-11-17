using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;

namespace TechAsset.Application.Interfaces;

// Contrato de escritura de usuarios. La implementación vive en Infrastructure (patrón Repository).
public interface IRepositorioDeUsuarios
{
    Task<Usuario?> ObtenerPorIdAsync(Guid idUsuario, CancellationToken cancellationToken = default);

    Task<Usuario?> ObtenerPorCorreoAsync(
        CorreoElectronico correoUsuario,
        CancellationToken cancellationToken = default);

    Task<bool> ExisteCorreoAsync(
        CorreoElectronico correoUsuario,
        Guid? exceptoIdUsuario,
        CancellationToken cancellationToken = default);

    Task<int> ContarAdministradoresActivosAsync(CancellationToken cancellationToken = default);

    Task AgregarAsync(Usuario usuario, CancellationToken cancellationToken = default);

    Task GuardarCambiosAsync(CancellationToken cancellationToken = default);
}
