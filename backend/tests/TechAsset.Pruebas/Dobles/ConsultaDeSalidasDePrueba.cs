using TechAsset.Application;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Pruebas.Dobles;

// Doble de las cinco consultas de salida (RF-13 a RF-17). Devuelve datos fijos y recuerda el alcance
// que recibió, para probar los endpoints y el alcance del panel sin base de datos.
public sealed class ConsultaDeSalidasDePrueba :
    IConsultaDeIndicadores,
    IConsultaDeEquiposPorEstado,
    IConsultaDeEquiposMasUtilizados,
    IConsultaDePrestamosPorArea,
    IConsultaDeMovimientos
{
    public Guid? IdUsuarioDelPanel { get; private set; }

    public FiltroDeEquiposPorEstado? UltimoFiltroDeEstados { get; private set; }

    public FiltroDeEquiposMasUtilizados? UltimoFiltroDeRanking { get; private set; }

    public FiltroDePrestamosPorArea? UltimoFiltroDeAreas { get; private set; }

    public FiltroDeMovimientos? UltimoFiltroDeMovimientos { get; private set; }

    public Task<IndicadoresDelPanel> ObtenerAsync(
        Guid? idUsuarioResponsable,
        CancellationToken cancellationToken = default)
    {
        IdUsuarioDelPanel = idUsuarioResponsable;

        return Task.FromResult(new IndicadoresDelPanel(
            9,
            5,
            2,
            1,
            4,
            ["Contabilidad"],
            new DateTimeOffset(2026, 11, 17, 15, 0, 0, TimeSpan.Zero)));
    }

    public Task<ReporteDeEquiposPorEstado> ObtenerAsync(
        FiltroDeEquiposPorEstado filtro,
        CancellationToken cancellationToken = default)
    {
        UltimoFiltroDeEstados = filtro;

        var equipos = new List<DatosDeEquipo>
        {
            new(Guid.NewGuid(), "TK-2026-0001", "Laptop Dell", CategoriaEquipo.Laptop, "Dell",
                EstadoEquipo.Disponible, true),
            new(Guid.NewGuid(), "TK-2026-0002", "Monitor LG", CategoriaEquipo.Monitor, "LG",
                EstadoEquipo.Mantenimiento, false)
        };

        return Task.FromResult(ReglasDeReportes.AgruparPorEstado(equipos));
    }

    public Task<IReadOnlyList<DatosDeEquipoMasUtilizado>> ObtenerAsync(
        FiltroDeEquiposMasUtilizados filtro,
        CancellationToken cancellationToken = default)
    {
        UltimoFiltroDeRanking = filtro;

        IReadOnlyList<DatosDeEquipoMasUtilizado> ranking =
        [
            new(Guid.NewGuid(), "TK-2026-0001", "Laptop Dell", CategoriaEquipo.Laptop, 4, ["Contabilidad"])
        ];

        return Task.FromResult(ranking);
    }

    public Task<ReporteDePrestamosPorArea> ObtenerAsync(
        FiltroDePrestamosPorArea filtro,
        CancellationToken cancellationToken = default)
    {
        UltimoFiltroDeAreas = filtro;

        return Task.FromResult(new ReporteDePrestamosPorArea(
            2,
            [new DatosDePrestamosPorArea("Contabilidad", 2, 100m)]));
    }

    public Task<PaginaDeMovimientos> ListarAsync(
        FiltroDeMovimientos filtro,
        CancellationToken cancellationToken = default)
    {
        UltimoFiltroDeMovimientos = filtro;

        return Task.FromResult(new PaginaDeMovimientos(
            1,
            filtro.Pagina,
            filtro.Tamano,
            [
                new DatosDeMovimiento(
                    Guid.NewGuid(),
                    TipoMovimiento.EquipoRegistrado,
                    new DateTimeOffset(2026, 11, 17, 15, 0, 0, TimeSpan.Zero),
                    Guid.NewGuid(),
                    "TK-2026-0001",
                    "Laptop Dell",
                    Guid.NewGuid(),
                    "Ana Pérez",
                    "Se registró el equipo TK-2026-0001 (Laptop Dell) en estado Disponible.")
            ]));
    }
}
