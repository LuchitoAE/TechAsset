using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Infrastructure.Persistencia;

namespace TechAsset.Infrastructure.Repositorios;

// Implementación del repositorio de préstamos sobre EF Core. Las lecturas de actualización usan
// seguimiento y la fila del préstamo se bloquea dentro de la transacción de aprobación o devolución.
public sealed class RepositorioDePrestamos(ContextoDeTechAsset contexto) : IRepositorioDePrestamos
{
    public Task<Prestamo?> ObtenerPorIdAsync(
        Guid idPrestamo,
        CancellationToken cancellationToken = default) =>
        contexto.Prestamos
            .Include(prestamo => prestamo.Equipo)
            .Include(prestamo => prestamo.Responsable)
            .FirstOrDefaultAsync(prestamo => prestamo.IdPrestamo == idPrestamo, cancellationToken);

    public Task<bool> ExisteActivoPorEquipoAsync(
        Guid idEquipo,
        CancellationToken cancellationToken = default) =>
        contexto.Prestamos.AnyAsync(
            prestamo => prestamo.IdEquipo == idEquipo
                && prestamo.EstadoPrestamo == EstadoPrestamo.Activo,
            cancellationToken);

    public Task<bool> ExistePorEquipoAsync(
        Guid idEquipo,
        CancellationToken cancellationToken = default) =>
        contexto.Prestamos.AnyAsync(prestamo => prestamo.IdEquipo == idEquipo, cancellationToken);

    // SELECT … FOR UPDATE: se ejecuta dentro de la transacción que abre la unidad de trabajo, para
    // que dos aprobaciones simultáneas se serialicen antes de leer el estado del préstamo.
    public Task BloquearParaActualizarAsync(
        Guid idPrestamo,
        CancellationToken cancellationToken = default) =>
        contexto.Database.ExecuteSqlAsync(
            $"SELECT 1 FROM prestamos WHERE id_prestamo = {idPrestamo} FOR UPDATE",
            cancellationToken);

    public async Task AgregarAsync(Prestamo prestamo, CancellationToken cancellationToken = default) =>
        await contexto.Prestamos.AddAsync(prestamo, cancellationToken);

    public Task GuardarCambiosAsync(CancellationToken cancellationToken = default) =>
        contexto.SaveChangesAsync(cancellationToken);
}
