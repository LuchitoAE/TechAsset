using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Comandos;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.CasosDeUso;

// RF-09, RN-01 a RN-05 y D-04: el Colaborador solicita; el equipo debe estar disponible y sin
// préstamo activo, la fecha posterior a hoy y el responsable es el de la sesión.
public class PruebasDeSolicitudDePrestamos
{
    private static readonly DateOnly Hoy = new(2026, 11, 17);

    private readonly RepositorioDeEquiposEnMemoria _equipos = new();
    private readonly RepositorioDeUsuariosEnMemoria _usuarios = new();
    private readonly RepositorioDePrestamosEnMemoria _prestamos = new();
    private readonly RelojDePrueba _reloj = new(Hoy);
    private readonly Usuario _colaborador = FabricaDeUsuarios.Crear(
        "ana@innovatech.pe",
        RolUsuario.Colaborador,
        nombres: "Ana",
        apellidos: "Pérez",
        area: "Contabilidad");

    public PruebasDeSolicitudDePrestamos()
    {
        _usuarios.Sembrar(_colaborador);
    }

    private SolicitarPrestamoCasoDeUso CasoDeUso() =>
        new(_equipos, _usuarios, _prestamos, _reloj);

    private static SolicitarPrestamoComando Comando(Equipo equipo, DateOnly? fechaDevolucion = null) => new(
        equipo.IdEquipo,
        fechaDevolucion ?? Hoy.AddDays(7),
        Guid.Empty,
        RolUsuario.Colaborador);

    [Fact]
    public async Task LaSolicitudQuedaPendienteYConElColaboradorComoResponsable()
    {
        var equipo = FabricaDeEquipos.Crear();
        _equipos.Sembrar(equipo);

        var prestamo = await CasoDeUso().EjecutarAsync(
            Comando(equipo) with { IdUsuarioSesion = _colaborador.IdUsuario });

        Assert.Equal(EstadoPrestamo.Solicitado, prestamo.EstadoPrestamo);
        Assert.Equal("Ana Pérez", prestamo.NombreResponsable);
        Assert.Equal("Contabilidad", prestamo.AreaResponsable);
        Assert.Equal(Hoy.AddDays(7), prestamo.FechaDevolucionPrestamo);
        Assert.Null(prestamo.FechaPrestamo);
        Assert.True(equipo.EstaDisponible);
        Assert.Single(_prestamos.Prestamos);
    }

    [Theory]
    [InlineData(EstadoEquipo.Mantenimiento)]
    [InlineData(EstadoEquipo.Baja)]
    public async Task NoSeSolicitaUnEquipoEnMantenimientoNiEnBaja(EstadoEquipo estado)
    {
        var equipo = FabricaDeEquipos.Crear(estado: estado);
        _equipos.Sembrar(equipo);

        var excepcion = await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            CasoDeUso().EjecutarAsync(
                Comando(equipo) with { IdUsuarioSesion = _colaborador.IdUsuario }));

        Assert.Contains(estado.ToString(), excepcion.Message);
        Assert.Empty(_prestamos.Prestamos);
    }

    [Fact]
    public async Task NoSeSolicitaUnEquipoQueYaTieneUnPrestamoActivo()
    {
        var equipo = FabricaDeEquipos.Crear();
        _equipos.Sembrar(equipo);

        // Préstamo activo en la base pero el estado del equipo quedó Disponible: la comprobación
        // debe hacerse contra el préstamo, no solo contra estado_equipo (RN-01).
        var activo = FabricaDePrestamos.Solicitar(equipo, _colaborador, Hoy.AddDays(5), Hoy);
        activo.Aprobar(Hoy);
        _prestamos.Sembrar(activo);

        var excepcion = await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            CasoDeUso().EjecutarAsync(
                Comando(equipo) with { IdUsuarioSesion = _colaborador.IdUsuario }));

        Assert.Contains("préstamo activo", excepcion.Message);
        Assert.Single(_prestamos.Prestamos);
    }

    [Theory]
    [InlineData(RolUsuario.Administrador)]
    [InlineData(RolUsuario.ResponsableDeTecnologia)]
    public async Task SoloElColaboradorPuedeSolicitar(RolUsuario rol)
    {
        var equipo = FabricaDeEquipos.Crear();
        _equipos.Sembrar(equipo);

        await Assert.ThrowsAsync<AccesoDenegadoExcepcion>(() =>
            CasoDeUso().EjecutarAsync(
                Comando(equipo) with { IdUsuarioSesion = _colaborador.IdUsuario, RolSesion = rol }));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-3)]
    public async Task NoSeSolicitaConUnaFechaQueNoEsPosteriorALaDeHoy(int dias)
    {
        var equipo = FabricaDeEquipos.Crear();
        _equipos.Sembrar(equipo);

        var excepcion = await Assert.ThrowsAsync<DatosInvalidosExcepcion>(() =>
            CasoDeUso().EjecutarAsync(
                Comando(equipo, Hoy.AddDays(dias)) with { IdUsuarioSesion = _colaborador.IdUsuario }));

        Assert.True(excepcion.Errores.ContainsKey(CamposDePrestamo.FechaDevolucionPrestamo));
    }

    [Fact]
    public async Task NoSeSolicitaUnEquipoInexistente()
    {
        await Assert.ThrowsAsync<RecursoNoEncontradoExcepcion>(() =>
            CasoDeUso().EjecutarAsync(
                new SolicitarPrestamoComando(
                    Guid.NewGuid(),
                    Hoy.AddDays(7),
                    _colaborador.IdUsuario,
                    RolUsuario.Colaborador)));
    }

    [Fact]
    public async Task UnColaboradorDeshabilitadoNoRecibePrestamos()
    {
        var inactivo = FabricaDeUsuarios.Crear("inactivo@innovatech.pe", activo: false);
        _usuarios.Sembrar(inactivo);

        var equipo = FabricaDeEquipos.Crear();
        _equipos.Sembrar(equipo);

        var excepcion = await Assert.ThrowsAsync<DatosInvalidosExcepcion>(() =>
            CasoDeUso().EjecutarAsync(
                Comando(equipo) with { IdUsuarioSesion = inactivo.IdUsuario }));

        Assert.True(excepcion.Errores.ContainsKey(CamposDePrestamo.IdUsuario));
    }

    [Fact]
    public async Task SinEquipoLaSolicitudRespondeConErrorDeCampo()
    {
        var excepcion = await Assert.ThrowsAsync<DatosInvalidosExcepcion>(() =>
            CasoDeUso().EjecutarAsync(
                new SolicitarPrestamoComando(
                    IdEquipo: null,
                    Hoy.AddDays(7),
                    _colaborador.IdUsuario,
                    RolUsuario.Colaborador)));

        Assert.True(excepcion.Errores.ContainsKey(CamposDePrestamo.IdEquipo));
    }
}
