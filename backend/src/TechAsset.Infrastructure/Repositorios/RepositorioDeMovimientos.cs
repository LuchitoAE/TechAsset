using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Entidades;
using TechAsset.Infrastructure.Persistencia;

namespace TechAsset.Infrastructure.Repositorios;

// Agrega movimientos al mismo contexto de la operación. No guarda por su cuenta: el GuardarCambios
// del caso de uso confirma el hecho y su movimiento juntos, dentro de la misma transacción (D-03).
public sealed class RepositorioDeMovimientos(ContextoDeTechAsset contexto) : IRepositorioDeMovimientos
{
    public async Task AgregarAsync(Movimiento movimiento, CancellationToken cancellationToken = default) =>
        await contexto.Movimientos.AddAsync(movimiento, cancellationToken);
}
