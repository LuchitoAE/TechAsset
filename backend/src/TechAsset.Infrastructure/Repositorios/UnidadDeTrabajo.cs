using TechAsset.Application.Interfaces;
using TechAsset.Infrastructure.Persistencia;

namespace TechAsset.Infrastructure.Repositorios;

// Unidad de trabajo sobre EF Core: la aprobación y la devolución cambian el préstamo y el equipo en
// una sola transacción; si una parte falla, no queda ningún cambio (D-05).
public sealed class UnidadDeTrabajo(ContextoDeTechAsset contexto) : IUnidadDeTrabajo
{
    public async Task<T> EjecutarEnTransaccionAsync<T>(
        Func<CancellationToken, Task<T>> operacion,
        CancellationToken cancellationToken = default)
    {
        // Si ya hay una transacción abierta (por ejemplo, una prueba o un caso de uso anidado), se
        // reutiliza en lugar de abrir otra.
        if (contexto.Database.CurrentTransaction is not null)
        {
            return await operacion(cancellationToken);
        }

        await using var transaccion = await contexto.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var resultado = await operacion(cancellationToken);
            await transaccion.CommitAsync(cancellationToken);
            return resultado;
        }
        catch
        {
            await transaccion.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
