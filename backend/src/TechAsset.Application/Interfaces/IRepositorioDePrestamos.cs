using TechAsset.Domain.Entidades;

namespace TechAsset.Application.Interfaces;

// Contrato de escritura de préstamos. La implementación vive en Infrastructure (patrón Repository).
public interface IRepositorioDePrestamos
{
    Task<Prestamo?> ObtenerPorIdAsync(Guid idPrestamo, CancellationToken cancellationToken = default);

    // RN-01: un equipo solo puede estar asociado a un préstamo activo.
    Task<bool> ExisteActivoPorEquipoAsync(Guid idEquipo, CancellationToken cancellationToken = default);

    // RN-06: un equipo con historial de préstamos no se puede eliminar.
    Task<bool> ExistePorEquipoAsync(Guid idEquipo, CancellationToken cancellationToken = default);

    // Bloquea la fila del préstamo dentro de la transacción para que la decisión y el cambio de
    // estado del equipo sean atómicos (SELECT … FOR UPDATE).
    Task BloquearParaActualizarAsync(Guid idPrestamo, CancellationToken cancellationToken = default);

    Task AgregarAsync(Prestamo prestamo, CancellationToken cancellationToken = default);

    Task GuardarCambiosAsync(CancellationToken cancellationToken = default);
}
