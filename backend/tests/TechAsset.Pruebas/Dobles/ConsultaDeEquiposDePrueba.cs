using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Pruebas.Dobles;

// Consulta de inventario en memoria: devuelve una página fija y guarda el filtro recibido para
// comprobar que la API lo normaliza y lo entrega tal cual al caso de uso.
public sealed class ConsultaDeEquiposDePrueba : IConsultaDeEquipos
{
    public static readonly Guid IdEquipo = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public FiltroDeEquipos? UltimoFiltro { get; private set; }

    public Task<PaginaDeEquipos> ListarAsync(
        FiltroDeEquipos filtro,
        CancellationToken cancellationToken = default)
    {
        UltimoFiltro = filtro;

        return Task.FromResult(new PaginaDeEquipos(
            1,
            filtro.Pagina,
            filtro.Tamano,
            [new ConteoDeEstadoEquipo(EstadoEquipo.Disponible, 1)],
            [EquipoDeEjemplo()]));
    }

    public Task<DatosDeEquipo?> ObtenerAsync(
        Guid idEquipo,
        CancellationToken cancellationToken = default) =>
        Task.FromResult<DatosDeEquipo?>(idEquipo == IdEquipo ? EquipoDeEjemplo() : null);

    private static DatosDeEquipo EquipoDeEjemplo() => new(
        IdEquipo,
        "TK-2026-0001",
        "Laptop Dell Latitude 5440",
        CategoriaEquipo.Laptop,
        "Dell",
        EstadoEquipo.Disponible,
        DisponibleEquipo: true);
}
