using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Comandos;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.CasosDeUso;

// RF-17 y D-03: cada operación que cambia el inventario o un préstamo deja su movimiento, con el
// equipo, el usuario de la sesión y el detalle que corresponde.
public class PruebasDeMovimientosDeOperaciones
{
    private static readonly DateOnly Hoy = new(2026, 11, 17);

    private readonly RepositorioDeEquiposEnMemoria _equipos = new();
    private readonly RepositorioDeUsuariosEnMemoria _usuarios = new();
    private readonly RepositorioDePrestamosEnMemoria _prestamos = new();
    private readonly RepositorioDeMovimientosEnMemoria _movimientos = new();
    private readonly UnidadDeTrabajoDePrueba _unidadDeTrabajo = new();
    private readonly RelojDePrueba _reloj = new(Hoy);
    private readonly Guid _idUsuario = Guid.NewGuid();
    private readonly Usuario _colaborador = FabricaDeUsuarios.Crear("ana@innovatech.pe");

    public PruebasDeMovimientosDeOperaciones()
    {
        _usuarios.Sembrar(_colaborador);
    }

    [Fact]
    public async Task RegistrarUnEquipoDejaSuMovimiento()
    {
        await new RegistrarEquipoCasoDeUso(_equipos, _movimientos, _reloj).EjecutarAsync(
            new RegistrarEquipoComando(
                "TK-2026-0200",
                "Laptop HP ProBook",
                CategoriaEquipo.Laptop,
                "HP",
                EstadoEquipo: null,
                _idUsuario));

        var movimiento = Assert.Single(_movimientos.Movimientos);
        Assert.Equal(TipoMovimiento.EquipoRegistrado, movimiento.TipoMovimiento);
        Assert.Equal(_idUsuario, movimiento.IdUsuario);
        Assert.Contains("TK-2026-0200", movimiento.DetalleMovimiento);
    }

    [Fact]
    public async Task ActualizarUnEquipoDejaSuMovimiento()
    {
        var equipo = FabricaDeEquipos.Crear("TK-2026-0201");
        _equipos.Sembrar(equipo);

        await new ActualizarEquipoCasoDeUso(_equipos, _prestamos, _movimientos, _reloj).EjecutarAsync(
            new ActualizarEquipoComando(
                equipo.IdEquipo,
                "TK-2026-0201",
                "Laptop HP ProBook 450",
                CategoriaEquipo.Laptop,
                "HP",
                _idUsuario));

        var movimiento = Assert.Single(_movimientos.Movimientos);
        Assert.Equal(TipoMovimiento.EquipoActualizado, movimiento.TipoMovimiento);
        Assert.Contains("ProBook 450", movimiento.DetalleMovimiento);
    }

    [Fact]
    public async Task CambiarElEstadoDejaSuMovimiento()
    {
        var equipo = FabricaDeEquipos.Crear("TK-2026-0202");
        _equipos.Sembrar(equipo);

        await new CambiarEstadoEquipoCasoDeUso(_equipos, _prestamos, _movimientos, _reloj).EjecutarAsync(
            new CambiarEstadoEquipoComando(
                equipo.IdEquipo,
                EstadoEquipo.Mantenimiento,
                _idUsuario,
                RolUsuario.ResponsableDeTecnologia));

        var movimiento = Assert.Single(_movimientos.Movimientos);
        Assert.Equal(TipoMovimiento.EquipoEstadoCambiado, movimiento.TipoMovimiento);
        Assert.Contains("Disponible", movimiento.DetalleMovimiento);
        Assert.Contains("Mantenimiento", movimiento.DetalleMovimiento);
    }

    [Fact]
    public async Task SolicitarUnPrestamoDejaSuMovimiento()
    {
        var equipo = FabricaDeEquipos.Crear("TK-2026-0203");
        _equipos.Sembrar(equipo);

        var prestamo = await new SolicitarPrestamoCasoDeUso(
                _equipos, _usuarios, _prestamos, _movimientos, _reloj)
            .EjecutarAsync(new SolicitarPrestamoComando(
                equipo.IdEquipo,
                Hoy.AddDays(7),
                _colaborador.IdUsuario,
                RolUsuario.Colaborador));

        var movimiento = Assert.Single(_movimientos.Movimientos);
        Assert.Equal(TipoMovimiento.PrestamoSolicitado, movimiento.TipoMovimiento);
        Assert.Equal(prestamo.IdPrestamo, movimiento.IdPrestamo);
        Assert.Equal(_colaborador.IdUsuario, movimiento.IdUsuario);
    }

    [Fact]
    public async Task AprobarUnPrestamoDejaSuMovimiento()
    {
        var equipo = FabricaDeEquipos.Crear("TK-2026-0204");
        _equipos.Sembrar(equipo);
        var prestamo = FabricaDePrestamos.Solicitar(equipo, _colaborador, Hoy.AddDays(7), Hoy);
        _prestamos.Sembrar(prestamo);

        await new AprobarPrestamoCasoDeUso(
                _prestamos, _equipos, _movimientos, _unidadDeTrabajo, _reloj)
            .EjecutarAsync(new AprobarPrestamoComando(
                prestamo.IdPrestamo,
                _idUsuario,
                RolUsuario.ResponsableDeTecnologia));

        var movimiento = Assert.Single(_movimientos.Movimientos);
        Assert.Equal(TipoMovimiento.PrestamoAprobado, movimiento.TipoMovimiento);
        Assert.Equal(_idUsuario, movimiento.IdUsuario);
    }

    [Fact]
    public async Task RechazarUnPrestamoDejaSuMovimiento()
    {
        var equipo = FabricaDeEquipos.Crear("TK-2026-0206");
        _equipos.Sembrar(equipo);
        var prestamo = FabricaDePrestamos.Solicitar(equipo, _colaborador, Hoy.AddDays(7), Hoy);
        _prestamos.Sembrar(prestamo);

        await new RechazarPrestamoCasoDeUso(_prestamos, _movimientos, _unidadDeTrabajo, _reloj)
            .EjecutarAsync(new RechazarPrestamoComando(
                prestamo.IdPrestamo,
                "Ya no corresponde.",
                _idUsuario,
                RolUsuario.ResponsableDeTecnologia));

        var movimiento = Assert.Single(_movimientos.Movimientos);
        Assert.Equal(TipoMovimiento.PrestamoRechazado, movimiento.TipoMovimiento);
        Assert.Contains("Ya no corresponde", movimiento.DetalleMovimiento);
    }

    [Fact]
    public async Task LaDevolucionDejaSuMovimiento()
    {
        var equipo = FabricaDeEquipos.Crear("TK-2026-0205");
        _equipos.Sembrar(equipo);
        var prestamo = FabricaDePrestamos.Activo(equipo, _colaborador, Hoy);
        _prestamos.Sembrar(prestamo);

        await new RegistrarDevolucionCasoDeUso(
                _prestamos, _equipos, _movimientos, _unidadDeTrabajo, _reloj)
            .EjecutarAsync(new RegistrarDevolucionComando(
                prestamo.IdPrestamo,
                "Devuelto con el cargador.",
                _idUsuario,
                RolUsuario.ResponsableDeTecnologia));

        var movimiento = Assert.Single(_movimientos.Movimientos);
        Assert.Equal(TipoMovimiento.PrestamoDevuelto, movimiento.TipoMovimiento);
        Assert.Contains("devolución", movimiento.DetalleMovimiento);
    }
}
