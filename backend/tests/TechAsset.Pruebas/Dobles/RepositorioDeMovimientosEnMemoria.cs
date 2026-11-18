using TechAsset.Application.Interfaces;
using TechAsset.Domain.Entidades;

namespace TechAsset.Pruebas.Dobles;

// Repositorio de movimientos en memoria: guarda lo que los casos de uso agregan para poder comprobar
// que cada hecho deja su rastro (RF-17) sin base de datos.
public sealed class RepositorioDeMovimientosEnMemoria : IRepositorioDeMovimientos
{
    private readonly List<Movimiento> _movimientos = [];

    public IReadOnlyList<Movimiento> Movimientos => _movimientos;

    public Task AgregarAsync(Movimiento movimiento, CancellationToken cancellationToken = default)
    {
        _movimientos.Add(movimiento);
        return Task.CompletedTask;
    }
}
