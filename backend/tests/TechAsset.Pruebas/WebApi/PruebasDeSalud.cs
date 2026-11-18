using System.Net;
using System.Text.Json;

namespace TechAsset.Pruebas.WebApi;

// Comprueba que la API arranca y que /api/salud responde con el formato acordado.
public class PruebasDeSalud(FabricaDePruebas fabrica) : IClassFixture<FabricaDePruebas>
{
    [Fact]
    public async Task LaSaludRespondeOkConElFormatoDeLaApi()
    {
        var cliente = fabrica.CreateClient();

        var respuesta = await cliente.GetAsync("/api/salud");

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);
        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        Assert.True(documento.RootElement.GetProperty("success").GetBoolean());
        Assert.Equal("ok", documento.RootElement.GetProperty("data").GetProperty("estado").GetString());
        Assert.Equal("TechAsset", documento.RootElement.GetProperty("data").GetProperty("producto").GetString());
        Assert.Equal(
            TechAsset.Domain.Comun.VersionDelProducto.Valor,
            documento.RootElement.GetProperty("data").GetProperty("version").GetString());
    }

    [Fact]
    public async Task LaSaludNoExigeSesion()
    {
        var cliente = fabrica.CreateClient();

        var respuesta = await cliente.GetAsync("/api/salud");

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);
    }
}
