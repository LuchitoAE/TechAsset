using TechAsset.Application.Interfaces;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;

namespace TechAsset.Pruebas.Dobles;

// Repositorio en memoria para probar los casos de uso sin PostgreSQL. Conserva la semántica del
// código patrimonial único (RN-07).
public sealed class RepositorioDeEquiposEnMemoria : IRepositorioDeEquipos
{
    private readonly List<Equipo> _equipos = [];

    public IReadOnlyList<Equipo> Equipos => _equipos;

    public void Sembrar(params Equipo[] equipos) => _equipos.AddRange(equipos);

    public Task<Equipo?> ObtenerPorIdAsync(
        Guid idEquipo,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(_equipos.FirstOrDefault(equipo => equipo.IdEquipo == idEquipo));

    public Task<bool> ExisteCodigoAsync(
        CodigoPatrimonial codigoPatrimonial,
        Guid? exceptoIdEquipo,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(_equipos.Any(equipo =>
            equipo.CodigoPatrimonial.Valor == codigoPatrimonial.Valor
            && (exceptoIdEquipo is null || equipo.IdEquipo != exceptoIdEquipo)));

    public Task AgregarAsync(Equipo equipo, CancellationToken cancellationToken = default)
    {
        _equipos.Add(equipo);
        return Task.CompletedTask;
    }

    public Task GuardarCambiosAsync(CancellationToken cancellationToken = default) =>
        Task.CompletedTask;
}
