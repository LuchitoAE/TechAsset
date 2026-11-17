using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Infrastructure.Persistencia;

namespace TechAsset.Infrastructure.Repositorios;

// Implementación del repositorio de equipos sobre EF Core. Las lecturas de actualización usan
// seguimiento; las de solo lectura, AsNoTracking.
public sealed class RepositorioDeEquipos(ContextoDeTechAsset contexto) : IRepositorioDeEquipos
{
    public Task<Equipo?> ObtenerPorIdAsync(
        Guid idEquipo,
        CancellationToken cancellationToken = default) =>
        contexto.Equipos.FirstOrDefaultAsync(
            equipo => equipo.IdEquipo == idEquipo,
            cancellationToken);

    public Task<bool> ExisteCodigoAsync(
        CodigoPatrimonial codigoPatrimonial,
        Guid? exceptoIdEquipo,
        CancellationToken cancellationToken = default) =>
        contexto.Equipos.AnyAsync(
            equipo => equipo.CodigoPatrimonial.Valor == codigoPatrimonial.Valor
                && (exceptoIdEquipo == null || equipo.IdEquipo != exceptoIdEquipo),
            cancellationToken);

    public async Task AgregarAsync(Equipo equipo, CancellationToken cancellationToken = default) =>
        await contexto.Equipos.AddAsync(equipo, cancellationToken);

    public Task GuardarCambiosAsync(CancellationToken cancellationToken = default) =>
        contexto.SaveChangesAsync(cancellationToken);
}
