namespace TechAsset.Application.Interfaces;

// Unidad de trabajo para las operaciones que cambian dos entidades a la vez (préstamo y equipo): la
// aprobación y la devolución se confirman o se deshacen juntas (D-05).
public interface IUnidadDeTrabajo
{
    Task<T> EjecutarEnTransaccionAsync<T>(
        Func<CancellationToken, Task<T>> operacion,
        CancellationToken cancellationToken = default);
}
