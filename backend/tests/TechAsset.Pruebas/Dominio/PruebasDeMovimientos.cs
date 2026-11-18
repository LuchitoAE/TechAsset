using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.Dominio;

// RF-17 y D-03: el movimiento valida sus datos y arma un detalle legible para cada tipo de hecho.
public class PruebasDeMovimientos
{
    private static readonly DateTimeOffset Ahora = new(2026, 11, 17, 15, 30, 0, TimeSpan.Zero);
    private static readonly Guid IdUsuario = Guid.NewGuid();

    [Fact]
    public void RechazaUnDetalleVacio()
    {
        var equipo = FabricaDeEquipos.Crear();

        var excepcion = Assert.Throws<DatosInvalidosExcepcion>(() => Movimiento.Registrar(
            TipoMovimiento.EquipoRegistrado,
            Ahora,
            equipo.IdEquipo,
            IdUsuario,
            idPrestamo: null,
            "   "));

        Assert.True(excepcion.Errores.ContainsKey("detalle_movimiento"));
    }

    [Fact]
    public void RechazaUnTipoFueraDelCatalogo()
    {
        var equipo = FabricaDeEquipos.Crear();

        Assert.Throws<DatosInvalidosExcepcion>(() => Movimiento.Registrar(
            (TipoMovimiento)99,
            Ahora,
            equipo.IdEquipo,
            IdUsuario,
            idPrestamo: null,
            "Detalle válido del movimiento."));
    }

    [Fact]
    public void ElAltaDeEquipoDescribeElCodigoYElEstado()
    {
        var equipo = FabricaDeEquipos.Crear("TK-2026-0100");

        var movimiento = Movimiento.DeEquipoRegistrado(equipo, IdUsuario, Ahora);

        Assert.Equal(TipoMovimiento.EquipoRegistrado, movimiento.TipoMovimiento);
        Assert.Equal(equipo.IdEquipo, movimiento.IdEquipo);
        Assert.Equal(IdUsuario, movimiento.IdUsuario);
        Assert.Null(movimiento.IdPrestamo);
        Assert.Contains("TK-2026-0100", movimiento.DetalleMovimiento);
        Assert.Contains("Disponible", movimiento.DetalleMovimiento);
        Assert.Equal(Ahora, movimiento.FechaMovimiento);
    }

    [Fact]
    public void ElCambioDeEstadoCuentaElEstadoAnteriorYElNuevo()
    {
        var equipo = FabricaDeEquipos.Crear();
        equipo.CambiarEstado(EstadoEquipo.Mantenimiento);

        var movimiento = Movimiento.DeCambioDeEstado(
            equipo,
            EstadoEquipo.Disponible,
            IdUsuario,
            Ahora);

        Assert.Equal(TipoMovimiento.EquipoEstadoCambiado, movimiento.TipoMovimiento);
        Assert.Contains("Disponible", movimiento.DetalleMovimiento);
        Assert.Contains("Mantenimiento", movimiento.DetalleMovimiento);
    }

    [Fact]
    public void LaAprobacionRegistraAlUsuarioQueApruebaYElPrestamo()
    {
        var hoy = new DateOnly(2026, 11, 17);
        var equipo = FabricaDeEquipos.Crear();
        var colaborador = FabricaDeUsuarios.Crear("ana@innovatech.pe", area: "Contabilidad");
        var prestamo = FabricaDePrestamos.Solicitar(equipo, colaborador, hoy.AddDays(7), hoy);
        prestamo.Aprobar(hoy);

        var movimiento = Movimiento.DePrestamoAprobado(prestamo, IdUsuario, Ahora);

        Assert.Equal(TipoMovimiento.PrestamoAprobado, movimiento.TipoMovimiento);
        Assert.Equal(IdUsuario, movimiento.IdUsuario);
        Assert.Equal(prestamo.IdPrestamo, movimiento.IdPrestamo);
        Assert.Contains("Ana Pérez", movimiento.DetalleMovimiento);
        Assert.Contains(equipo.CodigoPatrimonial.Valor, movimiento.DetalleMovimiento);
    }

    [Fact]
    public void ElRechazoGuardaElMotivoEnElDetalle()
    {
        var hoy = new DateOnly(2026, 11, 17);
        var equipo = FabricaDeEquipos.Crear();
        var colaborador = FabricaDeUsuarios.Crear("ana@innovatech.pe");
        var prestamo = FabricaDePrestamos.Solicitar(equipo, colaborador, hoy.AddDays(7), hoy);
        prestamo.Rechazar("El colaborador ya tiene una laptop asignada.");

        var movimiento = Movimiento.DePrestamoRechazado(prestamo, IdUsuario, Ahora);

        Assert.Equal(TipoMovimiento.PrestamoRechazado, movimiento.TipoMovimiento);
        Assert.Contains("laptop asignada", movimiento.DetalleMovimiento);
        Assert.True(movimiento.DetalleMovimiento.Length <= Movimiento.LongitudMaximaDetalle);
    }
}
