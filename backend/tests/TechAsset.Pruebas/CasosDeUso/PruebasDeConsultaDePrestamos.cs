using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Datos;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.CasosDeUso;

// RF-11 y RF-12: el Colaborador solo ve sus préstamos; el Responsable y el Administrador ven todo.
// Las consultas activas usan la consulta de activos y el detalle respeta el alcance por rol.
public class PruebasDeConsultaDePrestamos
{
    private static readonly DateOnly Hoy = new(2026, 11, 17);
    private static readonly Guid IdColaborador = Guid.NewGuid();
    private static readonly Guid IdOtroColaborador = Guid.NewGuid();

    private readonly ConsultaDePrestamosDePrueba _consulta = new();

    private ListarPrestamosCasoDeUso Listar() => new(_consulta);

    private ListarPrestamosActivosCasoDeUso ListarActivos() => new(_consulta);

    private ObtenerPrestamoCasoDeUso Obtener() => new(_consulta);

    private static FiltroDePrestamos Filtro() =>
        FiltroDePrestamos.Normalizar(
            texto: null, estado: null, idEquipo: null, area: null,
            desde: null, hasta: null, pagina: 1, tamano: 20);

    private static DetalleDePrestamo Detalle(Guid idUsuario, Guid? idPrestamo = null) => new(
        idPrestamo ?? Guid.NewGuid(),
        Guid.NewGuid(),
        "TK-2026-0001",
        "Laptop Dell Latitude",
        idUsuario,
        "Ana Pérez",
        "ana@innovatech.pe",
        "Contabilidad",
        Hoy,
        Hoy.AddDays(7),
        null,
        EstadoPrestamo.Activo,
        false,
        null,
        null);

    [Fact]
    public async Task ElColaboradorSoloConsultaSusPrestamos()
    {
        _consulta.Sembrar(Detalle(IdColaborador), Detalle(IdOtroColaborador));

        var pagina = await Listar().EjecutarAsync(
            Filtro(), IdColaborador, RolUsuario.Colaborador);

        Assert.Equal(IdColaborador, _consulta.UltimoFiltro?.IdUsuarioResponsable);
        Assert.Single(pagina.Prestamos);
    }

    [Theory]
    [InlineData(RolUsuario.Administrador)]
    [InlineData(RolUsuario.ResponsableDeTecnologia)]
    public async Task ElResponsableYElAdministradorVenTodoElHistorial(RolUsuario rol)
    {
        _consulta.Sembrar(Detalle(IdColaborador), Detalle(IdOtroColaborador));

        var pagina = await Listar().EjecutarAsync(Filtro(), IdOtroColaborador, rol);

        Assert.Null(_consulta.UltimoFiltro?.IdUsuarioResponsable);
        Assert.Equal(2, pagina.Total);
    }

    [Fact]
    public async Task LosPrestamosActivosUsanLaConsultaDeActivos()
    {
        _consulta.Sembrar(Detalle(IdColaborador));

        await ListarActivos().EjecutarAsync(Filtro(), IdColaborador, RolUsuario.ResponsableDeTecnologia);

        Assert.True(_consulta.UltimaConsultaFueDeActivos);
    }

    [Fact]
    public async Task ElColaboradorNoAbreElPrestamoDeOtro()
    {
        var ajeno = Detalle(IdOtroColaborador);
        _consulta.Sembrar(ajeno);

        await Assert.ThrowsAsync<AccesoDenegadoExcepcion>(() =>
            Obtener().EjecutarAsync(ajeno.IdPrestamo, IdColaborador, RolUsuario.Colaborador));
    }

    [Fact]
    public async Task ElColaboradorAbreSuPropioPrestamo()
    {
        var propio = Detalle(IdColaborador);
        _consulta.Sembrar(propio);

        var detalle = await Obtener().EjecutarAsync(propio.IdPrestamo, IdColaborador, RolUsuario.Colaborador);

        Assert.Equal(propio.IdPrestamo, detalle.IdPrestamo);
    }

    [Fact]
    public async Task ElResponsableAbreCualquierPrestamo()
    {
        var ajeno = Detalle(IdOtroColaborador);
        _consulta.Sembrar(ajeno);

        var detalle = await Obtener().EjecutarAsync(
            ajeno.IdPrestamo, IdColaborador, RolUsuario.ResponsableDeTecnologia);

        Assert.Equal(ajeno.IdPrestamo, detalle.IdPrestamo);
    }

    [Fact]
    public async Task UnPrestamoInexistenteRespondeNoEncontrado()
    {
        await Assert.ThrowsAsync<RecursoNoEncontradoExcepcion>(() =>
            Obtener().EjecutarAsync(Guid.NewGuid(), IdColaborador, RolUsuario.Administrador));
    }
}
