using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using TechAsset.Application.Datos;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Pruebas.WebApi;

// RF-09 a RF-12 y RNF-18: el historial se consulta con cualquier rol (el Colaborador solo lo suyo),
// los préstamos activos y las decisiones son del Responsable y del Administrador, y la solicitud es
// del Colaborador. La consulta de prueba evita la base de datos.
public class PruebasDePermisosDePrestamos : IClassFixture<FabricaDePruebasDePrestamos>
{
    private static readonly DateOnly Hoy = new(2026, 11, 17);

    private readonly FabricaDePruebasDePrestamos _fabrica;

    // La consulta del doble se comparte entre las pruebas de la clase; se deja un préstamo activo
    // del usuario de la sesión antes de cada una para que los totales sean deterministas.
    public PruebasDePermisosDePrestamos(FabricaDePruebasDePrestamos fabrica)
    {
        _fabrica = fabrica;
        fabrica.Consulta.Limpiar();
        fabrica.Consulta.Sembrar(Prestamo(AutenticacionDePrueba.IdUsuarioDePrueba));
    }

    private static DetalleDePrestamo Prestamo(Guid idUsuario, EstadoPrestamo estado = EstadoPrestamo.Activo) => new(
        Guid.NewGuid(),
        Guid.NewGuid(),
        "TK-2026-0001",
        "Laptop Dell Latitude",
        idUsuario,
        "Ana Pérez",
        "ana@innovatech.pe",
        "Contabilidad",
        estado == EstadoPrestamo.Solicitado ? null : Hoy,
        Hoy.AddDays(7),
        null,
        estado,
        false,
        null,
        null);

    [Fact]
    public async Task SinSesionElHistorialResponde401()
    {
        var cliente = _fabrica.CreateClient();

        var respuesta = await cliente.GetAsync("/api/prestamos");

        Assert.Equal(HttpStatusCode.Unauthorized, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        Assert.False(documento.RootElement.GetProperty("success").GetBoolean());
        Assert.False(string.IsNullOrWhiteSpace(documento.RootElement.GetProperty("message").GetString()));
    }

    [Fact]
    public async Task SinSesionNoSePuedeSolicitarUnPrestamo()
    {
        var cliente = _fabrica.CreateClient();

        var respuesta = await cliente.PostAsJsonAsync("/api/prestamos", new
        {
            id_equipo = Guid.NewGuid(),
            fecha_devolucion = Hoy.AddDays(7)
        });

        Assert.Equal(HttpStatusCode.Unauthorized, respuesta.StatusCode);
    }

    [Theory]
    [InlineData(nameof(RolUsuario.Administrador))]
    [InlineData(nameof(RolUsuario.ResponsableDeTecnologia))]
    [InlineData(nameof(RolUsuario.Colaborador))]
    public async Task LosTresRolesConsultanElHistorial(string rol)
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, rol);

        var respuesta = await cliente.GetAsync("/api/prestamos");

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        var datos = documento.RootElement.GetProperty("data");

        Assert.Equal(1, datos.GetProperty("total").GetInt32());
        Assert.Equal(
            "TK-2026-0001",
            datos.GetProperty("prestamos")[0].GetProperty("codigo_patrimonial_equipo").GetString());
        Assert.False(datos.GetProperty("prestamos")[0].GetProperty("vencido_prestamo").GetBoolean());
    }

    [Fact]
    public async Task ElColaboradorNoConsultaSoloLosPrestamosActivos()
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Colaborador));

        var respuesta = await cliente.GetAsync("/api/prestamos/activos");

        Assert.Equal(HttpStatusCode.Forbidden, respuesta.StatusCode);
    }

    [Theory]
    [InlineData(nameof(RolUsuario.Administrador))]
    [InlineData(nameof(RolUsuario.ResponsableDeTecnologia))]
    public async Task ElResponsableYElAdministradorConsultaLosActivos(string rol)
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, rol);

        var respuesta = await cliente.GetAsync("/api/prestamos/activos");

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        var datos = documento.RootElement.GetProperty("data");

        Assert.Equal(1, datos.GetProperty("total").GetInt32());
    }

    [Fact]
    public async Task ElColaboradorNoApruebaPrestamos()
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Colaborador));

        var respuesta = await cliente.PatchAsJsonAsync(
            $"/api/prestamos/{Guid.NewGuid()}/aprobacion",
            new { aprobado_prestamo = true });

        Assert.Equal(HttpStatusCode.Forbidden, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        Assert.False(string.IsNullOrWhiteSpace(documento.RootElement.GetProperty("message").GetString()));
    }

    [Fact]
    public async Task ElColaboradorNoRegistraDevoluciones()
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Colaborador));

        var respuesta = await cliente.PatchAsJsonAsync(
            $"/api/prestamos/{Guid.NewGuid()}/devolucion",
            new { observacion_prestamo = "Devuelto sin novedad." });

        Assert.Equal(HttpStatusCode.Forbidden, respuesta.StatusCode);
    }

    [Fact]
    public async Task ElColaboradorNoAbreElPrestamoDeOtro()
    {
        var ajeno = Prestamo(Guid.NewGuid());
        _fabrica.Consulta.Sembrar(ajeno);

        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Colaborador));

        var respuesta = await cliente.GetAsync($"/api/prestamos/{ajeno.IdPrestamo}");

        Assert.Equal(HttpStatusCode.Forbidden, respuesta.StatusCode);
    }

    [Fact]
    public async Task UnPrestamoInexistenteResponde404()
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Administrador));

        var respuesta = await cliente.GetAsync($"/api/prestamos/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, respuesta.StatusCode);
    }

    [Fact]
    public async Task SolicitarSinEquipoResponde400ConElCampo()
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Colaborador));

        var respuesta = await cliente.PostAsJsonAsync("/api/prestamos", new
        {
            fecha_devolucion = Hoy.AddDays(7)
        });

        Assert.Equal(HttpStatusCode.BadRequest, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        Assert.True(documento.RootElement.GetProperty("errors").TryGetProperty("id_equipo", out _));
    }

    [Fact]
    public async Task UnaFechaDeDevolucionMalEscritaResponde400EnEspanol()
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Colaborador));

        var respuesta = await cliente.PostAsJsonAsync("/api/prestamos", new
        {
            id_equipo = Guid.NewGuid(),
            fecha_devolucion = "31/12/2026"
        });

        Assert.Equal(HttpStatusCode.BadRequest, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        var mensajes = documento.RootElement.GetProperty("errors").GetProperty("fecha_devolucion");

        Assert.Contains("AAAA-MM-DD", mensajes[0].GetString());
    }
}
