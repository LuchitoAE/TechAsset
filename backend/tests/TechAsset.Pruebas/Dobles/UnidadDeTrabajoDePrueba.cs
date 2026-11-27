using TechAsset.Application.Interfaces;

namespace TechAsset.Pruebas.Dobles;

// Unidad de trabajo de prueba: ejecuta la operación tal cual. Los dobles en memoria no tienen
// transacciones, pero sí dejan comprobar que los casos de uso la usan y que el bloqueo se pide.
public sealed class UnidadDeTrabajoDePrueba : IUnidadDeTrabajo
{
    public int VecesEjecutada { get; private set; }

    public Task<T> EjecutarEnTransaccionAsync<T>(
        Func<CancellationToken, Task<T>> operacion,
        CancellationToken cancellationToken = default)
    {
        VecesEjecutada++;
        return operacion(cancellationToken);
    }
}
