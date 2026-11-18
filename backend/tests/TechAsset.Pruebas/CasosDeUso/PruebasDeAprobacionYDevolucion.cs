using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Comandos;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.CasosDeUso;

// RF-09, RF-10, D-05 y RN-01: aprobación, rechazo y devolución. Cada operación cambia el préstamo y
// el equipo en una sola transacción y con la fila del préstamo bloqueada.
public class PruebasDeAprobacionYDevolucion
{
    private static readonly DateOnly Hoy = new(2026, 11, 17);

    private readonly RepositorioDeEquiposEnMemoria _equipos = new();
    private readonly RepositorioDePrestamosEnMemoria _prestamos = new();
    private readonly UnidadDeTrabajoDePrueba _unidadDeTrabajo = new();
    private readonly RelojDePrueba _reloj = new(Hoy);
    private readonly Usuario _colaborador = FabricaDeUsuarios.Crear("ana@innovatech.pe");

    private AprobarPrestamoCasoDeUso Aprobar() =>
        new(_prestamos, _equipos, _unidadDeTrabajo, _reloj);

    private RechazarPrestamoCasoDeUso Rechazar() =>
        new(_prestamos, _unidadDeTrabajo, _reloj);

    private RegistrarDevolucionCasoDeUso Devolver() =>
        new(_prestamos, _equipos, _unidadDeTrabajo, _reloj);

    private (Equipo Equipo, Prestamo Prestamo) PrepararSolicitud(EstadoEquipo estado = EstadoEquipo.Disponible)
    {
        var equipo = FabricaDeEquipos.Crear(estado: estado);
        _equipos.Sembrar(equipo);

        var prestamo = FabricaDePrestamos.Solicitar(equipo, _colaborador, Hoy.AddDays(7), Hoy);
        _prestamos.Sembrar(prestamo);

        return (equipo, prestamo);
    }

    [Fact]
    public async Task AprobarDejaElPrestamoActivoYElEquipoPrestado()
    {
        var (equipo, prestamo) = PrepararSolicitud();

        var detalle = await Aprobar().EjecutarAsync(
            new AprobarPrestamoComando(prestamo.IdPrestamo, RolUsuario.ResponsableDeTecnologia));

        Assert.Equal(EstadoPrestamo.Activo, detalle.EstadoPrestamo);
        Assert.Equal(Hoy, detalle.FechaPrestamo);
        Assert.Equal(EstadoEquipo.Prestado, equipo.EstadoEquipo);
        Assert.False(detalle.VencidoPrestamo);
        Assert.Equal(1, _unidadDeTrabajo.VecesEjecutada);
        Assert.Equal(1, _prestamos.VecesBloqueado);
    }

    [Fact]
    public async Task ElAdministradorTambienAprueba()
    {
        var (equipo, prestamo) = PrepararSolicitud();

        var detalle = await Aprobar().EjecutarAsync(
            new AprobarPrestamoComando(prestamo.IdPrestamo, RolUsuario.Administrador));

        Assert.Equal(EstadoPrestamo.Activo, detalle.EstadoPrestamo);
        Assert.Equal(EstadoEquipo.Prestado, equipo.EstadoEquipo);
    }

    [Fact]
    public async Task NoSeApruebaSiElEquipoYaTieneOtroPrestamoActivo()
    {
        var (equipo, prestamo) = PrepararSolicitud();

        var otroActivo = FabricaDePrestamos.Solicitar(equipo, _colaborador, Hoy.AddDays(3), Hoy);
        otroActivo.Aprobar(Hoy);
        _prestamos.Sembrar(otroActivo);

        var excepcion = await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            Aprobar().EjecutarAsync(
                new AprobarPrestamoComando(prestamo.IdPrestamo, RolUsuario.ResponsableDeTecnologia)));

        Assert.Contains("préstamo activo", excepcion.Message);
        Assert.Equal(EstadoPrestamo.Solicitado, prestamo.EstadoPrestamo);
    }

    [Fact]
    public async Task NoSeApruebaUnEquipoQuePasoAMantenimiento()
    {
        var (equipo, prestamo) = PrepararSolicitud();

        equipo.CambiarEstado(EstadoEquipo.Mantenimiento);

        var excepcion = await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            Aprobar().EjecutarAsync(
                new AprobarPrestamoComando(prestamo.IdPrestamo, RolUsuario.ResponsableDeTecnologia)));

        Assert.Contains("Mantenimiento", excepcion.Message);
        Assert.Equal(EstadoEquipo.Mantenimiento, equipo.EstadoEquipo);
        Assert.Equal(EstadoPrestamo.Solicitado, prestamo.EstadoPrestamo);
    }

    [Fact]
    public async Task NoSeApruebaConLaFechaDeDevolucionYaVencida()
    {
        var (_, prestamo) = PrepararSolicitud();

        _reloj.Hoy = Hoy.AddDays(10);

        var excepcion = await Assert.ThrowsAsync<DatosInvalidosExcepcion>(() =>
            Aprobar().EjecutarAsync(
                new AprobarPrestamoComando(prestamo.IdPrestamo, RolUsuario.ResponsableDeTecnologia)));

        Assert.True(excepcion.Errores.ContainsKey(CamposDePrestamo.FechaDevolucionPrestamo));
        Assert.Equal(EstadoPrestamo.Solicitado, prestamo.EstadoPrestamo);
    }

    [Fact]
    public async Task ElColaboradorNoApruebaNiRechaza()
    {
        var (_, prestamo) = PrepararSolicitud();

        await Assert.ThrowsAsync<AccesoDenegadoExcepcion>(() =>
            Aprobar().EjecutarAsync(
                new AprobarPrestamoComando(prestamo.IdPrestamo, RolUsuario.Colaborador)));

        await Assert.ThrowsAsync<AccesoDenegadoExcepcion>(() =>
            Rechazar().EjecutarAsync(
                new RechazarPrestamoComando(prestamo.IdPrestamo, "No corresponde.", RolUsuario.Colaborador)));

        Assert.Equal(EstadoPrestamo.Solicitado, prestamo.EstadoPrestamo);
    }

    [Fact]
    public async Task NoSeApruebaUnPrestamoInexistente()
    {
        await Assert.ThrowsAsync<RecursoNoEncontradoExcepcion>(() =>
            Aprobar().EjecutarAsync(
                new AprobarPrestamoComando(Guid.NewGuid(), RolUsuario.ResponsableDeTecnologia)));
    }

    [Fact]
    public async Task NoSeApruebaDosVeces()
    {
        var (_, prestamo) = PrepararSolicitud();
        var comando = new AprobarPrestamoComando(prestamo.IdPrestamo, RolUsuario.ResponsableDeTecnologia);

        await Aprobar().EjecutarAsync(comando);

        await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() => Aprobar().EjecutarAsync(comando));
    }

    [Fact]
    public async Task RechazarDejaElPrestamoRechazadoYElEquipoIntacto()
    {
        var (equipo, prestamo) = PrepararSolicitud();

        var detalle = await Rechazar().EjecutarAsync(new RechazarPrestamoComando(
            prestamo.IdPrestamo,
            "El colaborador ya tiene una laptop asignada.",
            RolUsuario.ResponsableDeTecnologia));

        Assert.Equal(EstadoPrestamo.Rechazado, detalle.EstadoPrestamo);
        Assert.Equal("El colaborador ya tiene una laptop asignada.", detalle.MotivoRechazoPrestamo);
        Assert.Equal(EstadoEquipo.Disponible, equipo.EstadoEquipo);
    }

    [Fact]
    public async Task RechazarSinMotivoNoCambiaElPrestamo()
    {
        var (_, prestamo) = PrepararSolicitud();

        var excepcion = await Assert.ThrowsAsync<DatosInvalidosExcepcion>(() =>
            Rechazar().EjecutarAsync(new RechazarPrestamoComando(
                prestamo.IdPrestamo,
                " ",
                RolUsuario.ResponsableDeTecnologia)));

        Assert.True(excepcion.Errores.ContainsKey(CamposDePrestamo.MotivoRechazoPrestamo));
        Assert.Equal(EstadoPrestamo.Solicitado, prestamo.EstadoPrestamo);
    }

    [Fact]
    public async Task LaDevolucionDejaElPrestamoDevueltoYElEquipoDisponible()
    {
        var (equipo, prestamo) = PrepararSolicitud();
        await Aprobar().EjecutarAsync(
            new AprobarPrestamoComando(prestamo.IdPrestamo, RolUsuario.ResponsableDeTecnologia));

        _reloj.Hoy = Hoy.AddDays(3);

        var detalle = await Devolver().EjecutarAsync(new RegistrarDevolucionComando(
            prestamo.IdPrestamo,
            "Devuelto con el cargador y la funda.",
            RolUsuario.ResponsableDeTecnologia));

        Assert.Equal(EstadoPrestamo.Devuelto, detalle.EstadoPrestamo);
        Assert.Equal(Hoy.AddDays(3), detalle.FechaDevolucionRealPrestamo);
        Assert.Equal("Devuelto con el cargador y la funda.", detalle.ObservacionPrestamo);
        Assert.Equal(EstadoEquipo.Disponible, equipo.EstadoEquipo);
        Assert.True(equipo.EstaDisponible);
    }

    [Fact]
    public async Task LaDevolucionSinObservacionNoCambiaNada()
    {
        var (equipo, prestamo) = PrepararSolicitud();
        await Aprobar().EjecutarAsync(
            new AprobarPrestamoComando(prestamo.IdPrestamo, RolUsuario.ResponsableDeTecnologia));

        var excepcion = await Assert.ThrowsAsync<DatosInvalidosExcepcion>(() =>
            Devolver().EjecutarAsync(new RegistrarDevolucionComando(
                prestamo.IdPrestamo,
                "",
                RolUsuario.ResponsableDeTecnologia)));

        Assert.True(excepcion.Errores.ContainsKey(CamposDePrestamo.ObservacionPrestamo));
        Assert.Equal(EstadoPrestamo.Activo, prestamo.EstadoPrestamo);
        Assert.Equal(EstadoEquipo.Prestado, equipo.EstadoEquipo);
    }

    [Fact]
    public async Task ElColaboradorNoRegistraDevoluciones()
    {
        var (_, prestamo) = PrepararSolicitud();
        await Aprobar().EjecutarAsync(
            new AprobarPrestamoComando(prestamo.IdPrestamo, RolUsuario.ResponsableDeTecnologia));

        await Assert.ThrowsAsync<AccesoDenegadoExcepcion>(() =>
            Devolver().EjecutarAsync(new RegistrarDevolucionComando(
                prestamo.IdPrestamo,
                "Devuelto sin novedad.",
                RolUsuario.Colaborador)));

        Assert.Equal(EstadoPrestamo.Activo, prestamo.EstadoPrestamo);
    }

    [Fact]
    public async Task NoSeDevuelveUnPrestamoYaDevuelto()
    {
        var (_, prestamo) = PrepararSolicitud();
        await Aprobar().EjecutarAsync(
            new AprobarPrestamoComando(prestamo.IdPrestamo, RolUsuario.ResponsableDeTecnologia));
        var comando = new RegistrarDevolucionComando(
            prestamo.IdPrestamo,
            "Devuelto sin novedad.",
            RolUsuario.ResponsableDeTecnologia);

        await Devolver().EjecutarAsync(comando);

        var excepcion = await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            Devolver().EjecutarAsync(comando));
        Assert.Contains("ya fue devuelto", excepcion.Message);
    }

    [Fact]
    public async Task NoSeDevuelveUnPrestamoPendiente()
    {
        var (_, prestamo) = PrepararSolicitud();

        var excepcion = await Assert.ThrowsAsync<ConflictoDeNegocioExcepcion>(() =>
            Devolver().EjecutarAsync(new RegistrarDevolucionComando(
                prestamo.IdPrestamo,
                "Devuelto sin novedad.",
                RolUsuario.Administrador)));

        Assert.Contains("activo", excepcion.Message);
    }

    [Fact]
    public async Task NoSeDevuelveUnPrestamoInexistente()
    {
        await Assert.ThrowsAsync<RecursoNoEncontradoExcepcion>(() =>
            Devolver().EjecutarAsync(new RegistrarDevolucionComando(
                Guid.NewGuid(),
                "Devuelto sin novedad.",
                RolUsuario.Administrador)));
    }
}
