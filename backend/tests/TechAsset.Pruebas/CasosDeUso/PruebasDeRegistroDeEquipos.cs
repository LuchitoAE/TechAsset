using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Comandos;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.CasosDeUso;

// RF-05, RF-06 y RN-07: registro y actualización de equipos con código único.
public class PruebasDeRegistroDeEquipos
{
    private readonly RepositorioDeEquiposEnMemoria _repositorio = new();

    private readonly RepositorioDePrestamosEnMemoria _prestamos = new();

    private RegistrarEquipoCasoDeUso CasoDeUso() => new(_repositorio);

    private ActualizarEquipoCasoDeUso CasoDeActualizacion() => new(_repositorio, _prestamos);

    [Fact]
    public async Task RegistraUnEquipoDisponibleYNormalizaElCodigo()
    {
        var equipo = await CasoDeUso().EjecutarAsync(new RegistrarEquipoComando(
            "  tk-2026-0001 ",
            "Laptop Dell Latitude",
            CategoriaEquipo.Laptop,
            "Dell",
            EstadoEquipo: null));

        Assert.Equal("TK-2026-0001", equipo.CodigoPatrimonialEquipo);
        Assert.Equal(EstadoEquipo.Disponible, equipo.EstadoEquipo);
        Assert.True(equipo.DisponibleEquipo);
        Assert.Single(_repositorio.Equipos);
    }

    [Fact]
    public async Task RechazaUnCodigoDuplicadoConMayusculasYEspacios()
    {
        _repositorio.Sembrar(FabricaDeEquipos.Crear("TK-2026-0001"));

        var excepcion = await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new RegistrarEquipoComando(
                "  tk-2026-0001  ",
                "Otra laptop",
                CategoriaEquipo.Laptop,
                "HP",
                EstadoEquipo: null)));

        Assert.Contains("código patrimonial", excepcion.Message);
        Assert.Single(_repositorio.Equipos);
    }

    [Fact]
    public async Task RechazaUnaCategoriaInvalida()
    {
        var excepcion = await Assert.ThrowsAsync<DatosInvalidosExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new RegistrarEquipoComando(
                "TK-2026-0002",
                "Equipo raro",
                (CategoriaEquipo)42,
                "Genérica",
                EstadoEquipo: null)));

        Assert.True(excepcion.Errores.ContainsKey(CamposDeEquipo.CategoriaEquipo));
        Assert.Empty(_repositorio.Equipos);
    }

    [Fact]
    public async Task RechazaUnEstadoInicialPrestado()
    {
        var excepcion = await Assert.ThrowsAsync<DatosInvalidosExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new RegistrarEquipoComando(
                "TK-2026-0003",
                "Laptop Dell",
                CategoriaEquipo.Laptop,
                "Dell",
                EstadoEquipo.Prestado)));

        Assert.True(excepcion.Errores.ContainsKey(CamposDeEquipo.EstadoEquipo));
    }

    [Fact]
    public async Task ActualizaLosDatosSinTocarElEstado()
    {
        var equipo = FabricaDeEquipos.Crear(estado: EstadoEquipo.Mantenimiento);
        _repositorio.Sembrar(equipo);

        var actualizado = await CasoDeActualizacion().EjecutarAsync(new ActualizarEquipoComando(
            equipo.IdEquipo,
            "TK-2026-0100",
            "Proyector Epson",
            CategoriaEquipo.ProyectorMultimedia,
            "Epson"));

        Assert.Equal("TK-2026-0100", actualizado.CodigoPatrimonialEquipo);
        Assert.Equal("Proyector Epson", actualizado.NombreEquipo);
        Assert.Equal(CategoriaEquipo.ProyectorMultimedia, actualizado.CategoriaEquipo);
        Assert.Equal(EstadoEquipo.Mantenimiento, actualizado.EstadoEquipo);
    }

    [Fact]
    public async Task RechazaActualizarConUnCodigoDeOtroEquipo()
    {
        var primero = FabricaDeEquipos.Crear("TK-2026-0001");
        var segundo = FabricaDeEquipos.Crear("TK-2026-0002");
        _repositorio.Sembrar(primero, segundo);

        await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            CasoDeActualizacion().EjecutarAsync(new ActualizarEquipoComando(
                segundo.IdEquipo,
                " tk-2026-0001 ",
                segundo.NombreEquipo,
                segundo.CategoriaEquipo,
                segundo.MarcaEquipo)));

        Assert.Equal("TK-2026-0002", segundo.CodigoPatrimonial.Valor);
    }

    [Fact]
    public async Task NoCambiaElCodigoDeUnEquipoPrestado()
    {
        var equipo = FabricaDeEquipos.Crear(estado: EstadoEquipo.Prestado);
        _repositorio.Sembrar(equipo);

        var excepcion = await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            CasoDeActualizacion().EjecutarAsync(new ActualizarEquipoComando(
                equipo.IdEquipo,
                "TK-2026-0099",
                equipo.NombreEquipo,
                equipo.CategoriaEquipo,
                equipo.MarcaEquipo)));

        Assert.Contains("préstamo activo", excepcion.Message);
    }

    [Fact]
    public async Task ElPrestamoActivoBloqueaElCambioDeCodigoAunqueElEquipoDigaDisponible()
    {
        var equipo = FabricaDeEquipos.Crear();
        _repositorio.Sembrar(equipo);

        var usuario = FabricaDeUsuarios.Crear("ana@innovatech.pe");
        var hoy = new DateOnly(2026, 11, 17);
        var prestamo = FabricaDePrestamos.Solicitar(equipo, usuario, hoy.AddDays(7), hoy);
        prestamo.Aprobar(hoy);
        _prestamos.Sembrar(prestamo);

        var excepcion = await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            CasoDeActualizacion().EjecutarAsync(new ActualizarEquipoComando(
                equipo.IdEquipo,
                "TK-2026-0099",
                equipo.NombreEquipo,
                equipo.CategoriaEquipo,
                equipo.MarcaEquipo)));

        Assert.Contains("préstamo activo", excepcion.Message);
        Assert.Equal("TK-2026-0001", equipo.CodigoPatrimonial.Valor);
    }

    [Fact]
    public async Task NoActualizaUnEquipoInexistente()
    {
        await Assert.ThrowsAsync<RecursoNoEncontradoExcepcion>(() =>
            CasoDeActualizacion().EjecutarAsync(new ActualizarEquipoComando(
                Guid.NewGuid(),
                CodigoPatrimonial.Crear("TK-2026-0001").Valor,
                "Laptop",
                CategoriaEquipo.Laptop,
                "Dell")));
    }
}
