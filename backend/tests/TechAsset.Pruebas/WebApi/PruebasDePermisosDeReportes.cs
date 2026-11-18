using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Pruebas.WebApi;

// RF-13 a RF-17 y RNF-18: el panel lo consulta cualquier sesión (el Colaborador con su alcance); los
// cuatro reportes son del Responsable y del Administrador. Sin cookie, 401.
public class PruebasDePermisosDeReportes : IClassFixture<FabricaDePruebasDeReportes>
{
    private static readonly string[] Reportes =
    [
        "/api/reportes/equipos-por-estado",
        "/api/reportes/equipos-mas-utilizados",
        "/api/reportes/prestamos-por-area",
        "/api/reportes/movimientos"
    ];

    private readonly FabricaDePruebasDeReportes _fabrica;

    public PruebasDePermisosDeReportes(FabricaDePruebasDeReportes fabrica)
    {
        _fabrica = fabrica;
    }

    [Fact]
    public async Task SinSesionElPanelResponde401()
    {
        var cliente = _fabrica.CreateClient();

        var respuesta = await cliente.GetAsync("/api/reportes/panel");

        Assert.Equal(HttpStatusCode.Unauthorized, respuesta.StatusCode);
    }

    [Theory]
    [InlineData(nameof(RolUsuario.Administrador))]
    [InlineData(nameof(RolUsuario.ResponsableDeTecnologia))]
    [InlineData(nameof(RolUsuario.Colaborador))]
    public async Task LosTresRolesConsultanElPanel(string rol)
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, rol);

        var respuesta = await cliente.GetAsync("/api/reportes/panel");

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        var datos = documento.RootElement.GetProperty("data");

        Assert.Equal(9, datos.GetProperty("total_equipos").GetInt32());
        Assert.Equal(5, datos.GetProperty("equipos_disponibles").GetInt32());
        Assert.Equal(2, datos.GetProperty("equipos_prestados").GetInt32());
        Assert.Equal(1, datos.GetProperty("equipos_mantenimiento").GetInt32());
        Assert.Equal(4, datos.GetProperty("total_prestamos").GetInt32());
        Assert.Equal("Contabilidad", datos.GetProperty("areas_con_mayor_uso")[0].GetString());
        Assert.True(datos.TryGetProperty("fecha_corte", out _));
    }

    [Fact]
    public async Task ElPanelDelColaboradorAplicaSuAlcance()
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(
            AutenticacionDePrueba.EncabezadoDeRol,
            nameof(RolUsuario.Colaborador));

        await cliente.GetAsync("/api/reportes/panel");

        Assert.Equal(AutenticacionDePrueba.IdUsuarioDePrueba, _fabrica.Consulta.IdUsuarioDelPanel);
    }

    [Fact]
    public async Task ElColaboradorNoConsultaLosReportes()
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(
            AutenticacionDePrueba.EncabezadoDeRol,
            nameof(RolUsuario.Colaborador));

        foreach (var ruta in Reportes)
        {
            var respuesta = await cliente.GetAsync(ruta);
            Assert.Equal(HttpStatusCode.Forbidden, respuesta.StatusCode);
        }
    }

    [Theory]
    [InlineData(nameof(RolUsuario.Administrador))]
    [InlineData(nameof(RolUsuario.ResponsableDeTecnologia))]
    public async Task ElResponsableYElAdministradorConsultanLosCuatroReportes(string rol)
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, rol);

        foreach (var ruta in Reportes)
        {
            var respuesta = await cliente.GetAsync(ruta);
            Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);
        }
    }

    [Fact]
    public async Task LosMovimientosTambienSeConsultanPorSuRutaCorta()
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(
            AutenticacionDePrueba.EncabezadoDeRol,
            nameof(RolUsuario.ResponsableDeTecnologia));

        var respuesta = await cliente.GetAsync("/api/movimientos?tipo=EquipoRegistrado&pagina=1&tamano=5");

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        var datos = documento.RootElement.GetProperty("data");

        Assert.Equal(1, datos.GetProperty("total").GetInt32());
        Assert.Equal(
            "EquipoRegistrado",
            datos.GetProperty("movimientos")[0].GetProperty("tipo_movimiento").GetString());
        Assert.Equal(
            TipoMovimiento.EquipoRegistrado,
            _fabrica.Consulta.UltimoFiltroDeMovimientos?.TipoMovimiento);
        Assert.Equal(5, _fabrica.Consulta.UltimoFiltroDeMovimientos?.Tamano);
    }

    [Fact]
    public async Task ElReporteDeEquiposPorEstadoRecibeLosFiltros()
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(
            AutenticacionDePrueba.EncabezadoDeRol,
            nameof(RolUsuario.Administrador));

        var respuesta = await cliente.GetAsync(
            "/api/reportes/equipos-por-estado?categoria=Laptop&marca=Dell&texto=latitude");

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        var datos = documento.RootElement.GetProperty("data");

        Assert.Equal(2, datos.GetProperty("total").GetInt32());
        Assert.Equal(4, datos.GetProperty("estados").GetArrayLength());

        Assert.Equal("Laptop", _fabrica.Consulta.UltimoFiltroDeEstados?.Categoria.ToString());
        Assert.Equal("Dell", _fabrica.Consulta.UltimoFiltroDeEstados?.Marca);
        Assert.Equal("latitude", _fabrica.Consulta.UltimoFiltroDeEstados?.Texto);
    }

    [Fact]
    public async Task UnRangoDeAreasAlRevesResponde400ConElCampo()
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(
            AutenticacionDePrueba.EncabezadoDeRol,
            nameof(RolUsuario.ResponsableDeTecnologia));

        var respuesta = await cliente.GetAsync(
            "/api/reportes/prestamos-por-area?desde=2026-12-01&hasta=2026-11-01");

        Assert.Equal(HttpStatusCode.BadRequest, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        Assert.True(documento.RootElement.GetProperty("errors").TryGetProperty("desde", out _));
    }

    [Fact]
    public async Task UnTipoDeMovimientoInvalidoResponde400EnEspanol()
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(
            AutenticacionDePrueba.EncabezadoDeRol,
            nameof(RolUsuario.Administrador));

        var respuesta = await cliente.GetAsync("/api/movimientos?tipo=Nada");

        Assert.Equal(HttpStatusCode.BadRequest, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        var mensajes = documento.RootElement.GetProperty("errors").GetProperty("tipo");

        Assert.Contains("tipo de movimiento", mensajes[0].GetString());
    }

    [Fact]
    public async Task ElReporteDeAreasRecibeElPeriodo()
    {
        var cliente = _fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(
            AutenticacionDePrueba.EncabezadoDeRol,
            nameof(RolUsuario.Administrador));

        var respuesta = await cliente.GetAsync(
            "/api/reportes/prestamos-por-area?desde=2026-11-01&hasta=2026-11-30");

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);
        Assert.Equal(new DateOnly(2026, 11, 1), _fabrica.Consulta.UltimoFiltroDeAreas?.Desde);
        Assert.Equal(new DateOnly(2026, 11, 30), _fabrica.Consulta.UltimoFiltroDeAreas?.Hasta);
    }
}
