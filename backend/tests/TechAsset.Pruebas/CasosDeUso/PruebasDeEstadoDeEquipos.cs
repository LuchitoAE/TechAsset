using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Comandos;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.CasosDeUso;

// RF-08, D-05: solo Administrador y Responsable cambian el estado; un equipo prestado no se mueve
// a mano y Prestado no se asigna con el cambio de estado.
public class PruebasDeEstadoDeEquipos
{
    private readonly RepositorioDeEquiposEnMemoria _repositorio = new();

    private readonly RepositorioDePrestamosEnMemoria _prestamos = new();
    private readonly RepositorioDeMovimientosEnMemoria _movimientos = new();
    private readonly RelojDePrueba _reloj = new(new DateOnly(2026, 11, 17));
    private readonly Guid _idUsuario = Guid.NewGuid();

    private CambiarEstadoEquipoCasoDeUso CasoDeUso() =>
        new(_repositorio, _prestamos, _movimientos, _reloj);

    [Fact]
    public async Task UnColaboradorNoPuedeCambiarElEstado()
    {
        var equipo = FabricaDeEquipos.Crear();
        _repositorio.Sembrar(equipo);

        await Assert.ThrowsAsync<AccesoDenegadoExcepcion>(() => CasoDeUso().EjecutarAsync(
            new CambiarEstadoEquipoComando(
                equipo.IdEquipo,
                EstadoEquipo.Mantenimiento,
                _idUsuario,
                RolUsuario.Colaborador)));

        Assert.Equal(EstadoEquipo.Disponible, equipo.EstadoEquipo);
    }

    [Fact]
    public async Task ElResponsableCambiaElEstadoEntreDisponibleMantenimientoYBaja()
    {
        var equipo = FabricaDeEquipos.Crear();
        _repositorio.Sembrar(equipo);

        var enMantenimiento = await CasoDeUso().EjecutarAsync(new CambiarEstadoEquipoComando(
            equipo.IdEquipo,
            EstadoEquipo.Mantenimiento,
            _idUsuario,
            RolUsuario.ResponsableDeTecnologia));

        Assert.Equal(EstadoEquipo.Mantenimiento, enMantenimiento.EstadoEquipo);
        Assert.False(enMantenimiento.DisponibleEquipo);

        var deBaja = await CasoDeUso().EjecutarAsync(new CambiarEstadoEquipoComando(
            equipo.IdEquipo,
            EstadoEquipo.Baja,
            _idUsuario,
            RolUsuario.Administrador));

        Assert.Equal(EstadoEquipo.Baja, deBaja.EstadoEquipo);
    }

    [Fact]
    public async Task NoSePuedeDarDeBajaUnEquipoPrestado()
    {
        var equipo = FabricaDeEquipos.Crear(estado: EstadoEquipo.Prestado);
        _repositorio.Sembrar(equipo);

        var excepcion = await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new CambiarEstadoEquipoComando(
                equipo.IdEquipo,
                EstadoEquipo.Baja,
                _idUsuario,
                RolUsuario.Administrador)));

        Assert.Contains("devolución", excepcion.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(EstadoEquipo.Prestado, equipo.EstadoEquipo);
    }

    [Fact]
    public async Task NoSePuedePasarUnEquipoPrestadoAMantenimiento()
    {
        var equipo = FabricaDeEquipos.Crear(estado: EstadoEquipo.Prestado);
        _repositorio.Sembrar(equipo);

        await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new CambiarEstadoEquipoComando(
                equipo.IdEquipo,
                EstadoEquipo.Mantenimiento,
                _idUsuario,
                RolUsuario.ResponsableDeTecnologia)));

        Assert.Equal(EstadoEquipo.Prestado, equipo.EstadoEquipo);
    }

    [Fact]
    public async Task NoSePuedeAsignarPrestadoConElCambioDeEstado()
    {
        var equipo = FabricaDeEquipos.Crear();
        _repositorio.Sembrar(equipo);

        await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new CambiarEstadoEquipoComando(
                equipo.IdEquipo,
                EstadoEquipo.Prestado,
                _idUsuario,
                RolUsuario.Administrador)));

        Assert.Equal(EstadoEquipo.Disponible, equipo.EstadoEquipo);
    }

    [Fact]
    public async Task NoCambiaElEstadoDeUnEquipoInexistente()
    {
        await Assert.ThrowsAsync<RecursoNoEncontradoExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new CambiarEstadoEquipoComando(
                Guid.NewGuid(),
                EstadoEquipo.Mantenimiento,
                _idUsuario,
                RolUsuario.Administrador)));
    }

    [Fact]
    public async Task NoCambiaElEstadoDeUnEquipoConPrestamoActivoAunqueDigaDisponible()
    {
        var equipo = FabricaDeEquipos.Crear();
        _repositorio.Sembrar(equipo);

        var usuario = FabricaDeUsuarios.Crear("ana@innovatech.pe");
        var hoy = new DateOnly(2026, 11, 17);
        var prestamo = FabricaDePrestamos.Solicitar(equipo, usuario, hoy.AddDays(7), hoy);
        prestamo.Aprobar(hoy);
        _prestamos.Sembrar(prestamo);

        var excepcion = await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            CasoDeUso().EjecutarAsync(new CambiarEstadoEquipoComando(
                equipo.IdEquipo,
                EstadoEquipo.Baja,
                _idUsuario,
                RolUsuario.Administrador)));

        Assert.Contains("préstamo activo", excepcion.Message);
        Assert.Equal(EstadoEquipo.Disponible, equipo.EstadoEquipo);
    }
}
