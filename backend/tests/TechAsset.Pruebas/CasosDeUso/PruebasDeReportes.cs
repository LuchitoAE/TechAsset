using TechAsset.Application;
using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Datos;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.CasosDeUso;

// RF-13 a RF-17 y D-09: reglas puras de los reportes (indicadores, empates, ranking, áreas y
// estados) y alcance del panel por rol.
public class PruebasDeReportes
{
    private static readonly DateTimeOffset FechaCorte =
        new(2026, 11, 17, 15, 0, 0, TimeSpan.Zero);

    private readonly ConsultaDeSalidasDePrueba _consulta = new();

    [Fact]
    public void LosIndicadoresSumanLosCuatroEstadosEIncluyenBajaEnElTotal()
    {
        var indicadores = IndicadoresDelPanel.Desde(
            [
                new ConteoDeEstadoEquipo(EstadoEquipo.Disponible, 5),
                new ConteoDeEstadoEquipo(EstadoEquipo.Prestado, 2),
                new ConteoDeEstadoEquipo(EstadoEquipo.Mantenimiento, 1),
                new ConteoDeEstadoEquipo(EstadoEquipo.Baja, 1)
            ],
            totalPrestamos: 4,
            areasConMayorUso: ["Contabilidad"],
            fechaCorte: FechaCorte);

        Assert.Equal(9, indicadores.TotalEquipos);
        Assert.Equal(5, indicadores.EquiposDisponibles);
        Assert.Equal(2, indicadores.EquiposPrestados);
        Assert.Equal(1, indicadores.EquiposMantenimiento);
        Assert.Equal(4, indicadores.TotalPrestamos);
        Assert.Equal(["Contabilidad"], indicadores.AreasConMayorUso);
        Assert.Equal(FechaCorte, indicadores.FechaCorte);
    }

    [Fact]
    public void LosEstadosSinEquiposSeMuestranEnCero()
    {
        var indicadores = IndicadoresDelPanel.Desde(
            [new ConteoDeEstadoEquipo(EstadoEquipo.Disponible, 3)],
            totalPrestamos: 0,
            areasConMayorUso: [],
            fechaCorte: FechaCorte);

        Assert.Equal(3, indicadores.TotalEquipos);
        Assert.Equal(0, indicadores.EquiposPrestados);
        Assert.Equal(0, indicadores.EquiposMantenimiento);
    }

    [Fact]
    public void LasAreasConMayorUsoMuestranTodasLasQueEmpatan()
    {
        var areas = ReglasDeReportes.AreasConMayorUso(
        [
            new ConteoDePrestamosPorArea("Soporte", 3),
            new ConteoDePrestamosPorArea("Contabilidad", 3),
            new ConteoDePrestamosPorArea("Desarrollo", 1)
        ]);

        Assert.Equal(["Contabilidad", "Soporte"], areas);
    }

    [Fact]
    public void SinPrestamosNoHayAreaConMayorUso()
    {
        var areas = ReglasDeReportes.AreasConMayorUso(
            [new ConteoDePrestamosPorArea("Contabilidad", 0)]);

        Assert.Empty(areas);
    }

    [Fact]
    public void ElRankingOrdenaPorCantidadYDesempataPorCodigo()
    {
        var filas = new List<DatosDeEquipoMasUtilizado>
        {
            new(Guid.NewGuid(), "TK-2026-0003", "Monitor", CategoriaEquipo.Monitor, 3, []),
            new(Guid.NewGuid(), "TK-2026-0001", "Laptop", CategoriaEquipo.Laptop, 3, []),
            new(Guid.NewGuid(), "TK-2026-0004", "Tablet", CategoriaEquipo.Tablet, 5, []),
            new(Guid.NewGuid(), "TK-2026-0002", "Impresora", CategoriaEquipo.Impresora, 1, [])
        };

        var ranking = ReglasDeReportes.OrdenarRanking(filas, limite: 3);

        Assert.Equal(
            ["TK-2026-0004", "TK-2026-0001", "TK-2026-0003"],
            ranking.Select(fila => fila.CodigoPatrimonialEquipo));
    }

    [Fact]
    public void ElRankingRespetaElLimitePedido()
    {
        var filas = Enumerable.Range(1, 15)
            .Select(numero => new DatosDeEquipoMasUtilizado(
                Guid.NewGuid(),
                $"TK-2026-{numero:0000}",
                $"Equipo {numero}",
                CategoriaEquipo.Laptop,
                numero,
                []))
            .ToList();

        var ranking = ReglasDeReportes.OrdenarRanking(filas, FiltroDeEquiposMasUtilizados.LimitePredeterminado);

        Assert.Equal(10, ranking.Count);
    }

    [Fact]
    public void LasAreasSinPrestamosAparecenEnCeroYLosPorcentajesSumanCien()
    {
        var reporte = ReglasDeReportes.CompletarAreas(
            ["Contabilidad", "Soporte", "Administración"],
            [
                new ConteoDePrestamosPorArea("Contabilidad", 2),
                new ConteoDePrestamosPorArea("Soporte", 1)
            ]);

        Assert.Equal(3, reporte.TotalPrestamos);
        Assert.Equal(3, reporte.Areas.Count);
        Assert.Equal(66.7m, reporte.Areas[0].PorcentajePrestamos);
        Assert.Equal(33.3m, reporte.Areas[1].PorcentajePrestamos);
        Assert.Equal(0m, reporte.Areas[2].PorcentajePrestamos);
        Assert.Equal(100m, reporte.Areas.Sum(area => area.PorcentajePrestamos));
    }

    [Fact]
    public void ElReporteDeEstadosSiempreTraeLosCuatroYSumaElTotal()
    {
        var reporte = ReglasDeReportes.AgruparPorEstado(
        [
            new DatosDeEquipo(Guid.NewGuid(), "TK-2026-0002", "Monitor", CategoriaEquipo.Monitor, "LG",
                EstadoEquipo.Disponible, true),
            new DatosDeEquipo(Guid.NewGuid(), "TK-2026-0001", "Laptop", CategoriaEquipo.Laptop, "Dell",
                EstadoEquipo.Disponible, true),
            new DatosDeEquipo(Guid.NewGuid(), "TK-2026-0003", "Tablet", CategoriaEquipo.Tablet, "Samsung",
                EstadoEquipo.Mantenimiento, false)
        ]);

        Assert.Equal(3, reporte.Total);
        Assert.Equal(4, reporte.Estados.Count);
        Assert.Equal(3, reporte.Estados.Sum(estado => estado.Total));
        Assert.Equal(
            ["TK-2026-0001", "TK-2026-0002"],
            reporte.Estados[0].Equipos.Select(equipo => equipo.CodigoPatrimonialEquipo));
    }

    [Theory]
    [InlineData(RolUsuario.Administrador)]
    [InlineData(RolUsuario.ResponsableDeTecnologia)]
    public async Task ElResponsableYElAdministradorVenElPanelCompleto(RolUsuario rol)
    {
        await new ObtenerIndicadoresDelPanelCasoDeUso(_consulta).EjecutarAsync(
            Guid.NewGuid(),
            rol);

        Assert.Null(_consulta.IdUsuarioDelPanel);
    }

    [Fact]
    public async Task ElColaboradorVeSoloSusPrestamosEnElPanel()
    {
        var idColaborador = Guid.NewGuid();

        await new ObtenerIndicadoresDelPanelCasoDeUso(_consulta).EjecutarAsync(
            idColaborador,
            RolUsuario.Colaborador);

        Assert.Equal(idColaborador, _consulta.IdUsuarioDelPanel);
    }

    [Fact]
    public async Task ElReporteDeAreasRechazaUnRangoAlReves()
    {
        var casoDeUso = new ConsultarPrestamosPorAreaCasoDeUso(_consulta);

        var excepcion = await Assert.ThrowsAsync<DatosInvalidosExcepcion>(() =>
            casoDeUso.EjecutarAsync(FiltroDePrestamosPorArea.Normalizar(
                new DateOnly(2026, 12, 1),
                new DateOnly(2026, 11, 1))));

        Assert.True(excepcion.Errores.ContainsKey("desde"));
    }

    [Fact]
    public async Task ElHistorialRechazaUnRangoAlReves()
    {
        var casoDeUso = new ConsultarMovimientosCasoDeUso(_consulta);
        var filtro = FiltroDeMovimientos.Normalizar(
            null, null, null, null,
            new DateOnly(2026, 12, 1),
            new DateOnly(2026, 11, 1),
            pagina: 1,
            tamano: 20);

        var excepcion = await Assert.ThrowsAsync<DatosInvalidosExcepcion>(() =>
            casoDeUso.EjecutarAsync(filtro));

        Assert.True(excepcion.Errores.ContainsKey("desde"));
    }

    [Fact]
    public void ElRangoDeFechasConvierteLosDiasDeLimaAUtc()
    {
        var (desde, hastaExclusivo) = RangoDeFechas.DelDia(
            new DateOnly(2026, 11, 17),
            new DateOnly(2026, 11, 17));

        Assert.Equal(new DateTimeOffset(2026, 11, 17, 5, 0, 0, TimeSpan.Zero), desde);
        Assert.Equal(new DateTimeOffset(2026, 11, 18, 5, 0, 0, TimeSpan.Zero), hastaExclusivo);
    }
}
