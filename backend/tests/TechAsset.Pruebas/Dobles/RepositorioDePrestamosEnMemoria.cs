using TechAsset.Application.Interfaces;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Pruebas.Dobles;

// Repositorio en memoria para probar los casos de uso sin PostgreSQL. Conserva la semántica de
// RN-01 (un solo préstamo activo por equipo) y de RN-06 (historial por equipo).
public sealed class RepositorioDePrestamosEnMemoria : IRepositorioDePrestamos
{
    private readonly List<Prestamo> _prestamos = [];

    public IReadOnlyList<Prestamo> Prestamos => _prestamos;

    public int VecesBloqueado { get; private set; }

    public void Sembrar(params Prestamo[] prestamos) => _prestamos.AddRange(prestamos);

    public Task<Prestamo?> ObtenerPorIdAsync(
        Guid idPrestamo,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(_prestamos.FirstOrDefault(prestamo => prestamo.IdPrestamo == idPrestamo));

    public Task<bool> ExisteActivoPorEquipoAsync(
        Guid idEquipo,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(_prestamos.Any(prestamo =>
            prestamo.IdEquipo == idEquipo && prestamo.EstadoPrestamo == EstadoPrestamo.Activo));

    public Task<bool> ExistePorEquipoAsync(
        Guid idEquipo,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(_prestamos.Any(prestamo => prestamo.IdEquipo == idEquipo));

    public Task BloquearParaActualizarAsync(
        Guid idPrestamo,
        CancellationToken cancellationToken = default)
    {
        VecesBloqueado++;
        return Task.CompletedTask;
    }

    public Task AgregarAsync(Prestamo prestamo, CancellationToken cancellationToken = default)
    {
        _prestamos.Add(prestamo);
        return Task.CompletedTask;
    }

    public Task GuardarCambiosAsync(CancellationToken cancellationToken = default) =>
        Task.CompletedTask;
}
