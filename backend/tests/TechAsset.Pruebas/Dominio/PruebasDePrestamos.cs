using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.Dominio;

// RF-09, RF-10, RN-02, RN-03, RN-04, RN-05, RN-10 y D-04: reglas del préstamo en el dominio.
public class PruebasDePrestamos
{
    private static readonly DateOnly Hoy = new(2026, 11, 17);

    private static DateTimeOffset Ahora => new(Hoy.ToDateTime(new TimeOnly(9, 0)), TimeSpan.Zero);

    private static (Equipo Equipo, Usuario Responsable) Preparar()
    {
        var equipo = FabricaDeEquipos.Crear();
        var responsable = FabricaDeUsuarios.Crear("ana@innovatech.pe");
        return (equipo, responsable);
    }

    [Fact]
    public void SolicitarDejaElPrestamoPendienteYElEquipoLibre()
    {
        var (equipo, responsable) = Preparar();

        var prestamo = Prestamo.Solicitar(equipo, responsable, Hoy.AddDays(7), Hoy, Ahora);

        Assert.Equal(EstadoPrestamo.Solicitado, prestamo.EstadoPrestamo);
        Assert.Null(prestamo.Periodo.FechaPrestamo);
        Assert.Equal(Hoy.AddDays(7), prestamo.Periodo.FechaDevolucionPrestamo);
        Assert.Equal(responsable.IdUsuario, prestamo.IdUsuario);
        Assert.Equal(Hoy.ToDateTime(new TimeOnly(9, 0)), prestamo.FechaSolicitudPrestamo.UtcDateTime);
        Assert.True(equipo.EstaDisponible);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void SolicitarExigeUnaFechaDeDevolucionPosteriorALaDeHoy(int dias)
    {
        var (equipo, responsable) = Preparar();

        var excepcion = Assert.Throws<DatosInvalidosExcepcion>(() =>
            Prestamo.Solicitar(equipo, responsable, Hoy.AddDays(dias), Hoy, Ahora));

        Assert.True(excepcion.Errores.ContainsKey(CamposDePrestamo.FechaDevolucionPrestamo));
    }

    [Fact]
    public void SolicitarExigeLaFechaDeDevolucion()
    {
        var (equipo, responsable) = Preparar();

        var excepcion = Assert.Throws<DatosInvalidosExcepcion>(() =>
            Prestamo.Solicitar(equipo, responsable, null, Hoy, Ahora));

        Assert.True(excepcion.Errores.ContainsKey(CamposDePrestamo.FechaDevolucionPrestamo));
    }

    [Theory]
    [InlineData(EstadoEquipo.Mantenimiento)]
    [InlineData(EstadoEquipo.Baja)]
    public void NoSeSolicitaUnEquipoEnMantenimientoNiEnBaja(EstadoEquipo estado)
    {
        var (_, responsable) = Preparar();
        var equipo = FabricaDeEquipos.Crear(estado: estado);

        var excepcion = Assert.Throws<ConflictoDeNegocioExcepcion>(() =>
            Prestamo.Solicitar(equipo, responsable, Hoy.AddDays(7), Hoy, Ahora));

        Assert.Contains(estado.ToString(), excepcion.Message);
    }

    [Fact]
    public void SolicitarExigeUnResponsableActivo()
    {
        var (equipo, _) = Preparar();

        var sinResponsable = Assert.Throws<DatosInvalidosExcepcion>(() =>
            Prestamo.Solicitar(equipo, null, Hoy.AddDays(7), Hoy, Ahora));
        Assert.True(sinResponsable.Errores.ContainsKey(CamposDePrestamo.IdUsuario));

        var inactivo = FabricaDeUsuarios.Crear("inactivo@innovatech.pe", activo: false);
        var conInactivo = Assert.Throws<DatosInvalidosExcepcion>(() =>
            Prestamo.Solicitar(equipo, inactivo, Hoy.AddDays(7), Hoy, Ahora));
        Assert.True(conInactivo.Errores.ContainsKey(CamposDePrestamo.IdUsuario));
    }

    [Fact]
    public void AprobarFijaLaFechaDePrestamoYDejaElPrestamoActivo()
    {
        var (equipo, responsable) = Preparar();
        var prestamo = Prestamo.Solicitar(equipo, responsable, Hoy.AddDays(7), Hoy, Ahora);

        prestamo.Aprobar(Hoy.AddDays(1));

        Assert.Equal(EstadoPrestamo.Activo, prestamo.EstadoPrestamo);
        Assert.Equal(Hoy.AddDays(1), prestamo.Periodo.FechaPrestamo);
        Assert.True(prestamo.EstaActivo);
    }

    [Fact]
    public void NoSeApruebaSiLaDevolucionNoEsPosteriorALaFechaDePrestamo()
    {
        var (equipo, responsable) = Preparar();
        var prestamo = Prestamo.Solicitar(equipo, responsable, Hoy.AddDays(2), Hoy, Ahora);

        var excepcion = Assert.Throws<DatosInvalidosExcepcion>(() =>
            prestamo.Aprobar(Hoy.AddDays(2)));

        Assert.True(excepcion.Errores.ContainsKey(CamposDePrestamo.FechaDevolucionPrestamo));
        Assert.Equal(EstadoPrestamo.Solicitado, prestamo.EstadoPrestamo);
        Assert.Null(prestamo.Periodo.FechaPrestamo);
    }

    [Fact]
    public void NoSeApruebaUnPrestamoQueYaNoEstaPendiente()
    {
        var (equipo, responsable) = Preparar();
        var prestamo = Prestamo.Solicitar(equipo, responsable, Hoy.AddDays(7), Hoy, Ahora);
        prestamo.Aprobar(Hoy);

        Assert.Throws<ConflictoDeNegocioExcepcion>(() => prestamo.Aprobar(Hoy));
    }

    [Fact]
    public void RechazarGuardaElMotivoYNoOcupaElEquipo()
    {
        var (equipo, responsable) = Preparar();
        var prestamo = Prestamo.Solicitar(equipo, responsable, Hoy.AddDays(7), Hoy, Ahora);

        prestamo.Rechazar("El colaborador ya tiene un equipo asignado.");

        Assert.Equal(EstadoPrestamo.Rechazado, prestamo.EstadoPrestamo);
        Assert.Equal("El colaborador ya tiene un equipo asignado.", prestamo.MotivoRechazoPrestamo);
        Assert.True(equipo.EstaDisponible);
    }

    [Fact]
    public void RechazarExigeElMotivo()
    {
        var (equipo, responsable) = Preparar();
        var prestamo = Prestamo.Solicitar(equipo, responsable, Hoy.AddDays(7), Hoy, Ahora);

        var excepcion = Assert.Throws<DatosInvalidosExcepcion>(() => prestamo.Rechazar("  "));

        Assert.True(excepcion.Errores.ContainsKey(CamposDePrestamo.MotivoRechazoPrestamo));
        Assert.Equal(EstadoPrestamo.Solicitado, prestamo.EstadoPrestamo);
    }

    [Fact]
    public void NoSeDevuelveUnPrestamoPendiente()
    {
        var (equipo, responsable) = Preparar();
        var prestamo = Prestamo.Solicitar(equipo, responsable, Hoy.AddDays(7), Hoy, Ahora);

        Assert.Throws<ConflictoDeNegocioExcepcion>(() =>
            prestamo.RegistrarDevolucion("Devuelto sin novedad.", Hoy));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("mal")]
    public void LaDevolucionExigeObservaciones(string? observacion)
    {
        var (equipo, responsable) = Preparar();
        var prestamo = Prestamo.Solicitar(equipo, responsable, Hoy.AddDays(7), Hoy, Ahora);
        prestamo.Aprobar(Hoy);

        var excepcion = Assert.Throws<DatosInvalidosExcepcion>(() =>
            prestamo.RegistrarDevolucion(observacion, Hoy.AddDays(3)));

        Assert.True(excepcion.Errores.ContainsKey(CamposDePrestamo.ObservacionPrestamo));
        Assert.Equal(EstadoPrestamo.Activo, prestamo.EstadoPrestamo);
        Assert.Null(prestamo.FechaDevolucionRealPrestamo);
    }

    [Fact]
    public void LaDevolucionFijaLaFechaRealYTerminaElPrestamo()
    {
        var (equipo, responsable) = Preparar();
        var prestamo = Prestamo.Solicitar(equipo, responsable, Hoy.AddDays(7), Hoy, Ahora);
        prestamo.Aprobar(Hoy);

        prestamo.RegistrarDevolucion("  Devuelto con el cargador y sin golpes.  ", Hoy.AddDays(3));

        Assert.Equal(EstadoPrestamo.Devuelto, prestamo.EstadoPrestamo);
        Assert.Equal(Hoy.AddDays(3), prestamo.FechaDevolucionRealPrestamo);
        Assert.Equal("Devuelto con el cargador y sin golpes.", prestamo.ObservacionPrestamo);
        Assert.True(prestamo.EstaDevuelto);
    }

    [Fact]
    public void NoSeDevuelveDosVeces()
    {
        var (equipo, responsable) = Preparar();
        var prestamo = Prestamo.Solicitar(equipo, responsable, Hoy.AddDays(7), Hoy, Ahora);
        prestamo.Aprobar(Hoy);
        prestamo.RegistrarDevolucion("Devuelto sin novedad.", Hoy);

        var excepcion = Assert.Throws<ConflictoDeNegocioExcepcion>(() =>
            prestamo.RegistrarDevolucion("Otra vez devuelto.", Hoy));

        Assert.Contains("ya fue devuelto", excepcion.Message);
    }

    [Fact]
    public void ElVencimientoSeCalculaConLaFechaDeHoy()
    {
        var (equipo, responsable) = Preparar();
        var prestamo = Prestamo.Solicitar(equipo, responsable, Hoy.AddDays(3), Hoy, Ahora);
        prestamo.Aprobar(Hoy);

        Assert.False(prestamo.EstaVencido(Hoy.AddDays(3)));
        Assert.True(prestamo.EstaVencido(Hoy.AddDays(4)));

        prestamo.RegistrarDevolucion("Devuelto tarde, sin novedad.", Hoy.AddDays(5));
        Assert.False(prestamo.EstaVencido(Hoy.AddDays(10)));
    }
}
