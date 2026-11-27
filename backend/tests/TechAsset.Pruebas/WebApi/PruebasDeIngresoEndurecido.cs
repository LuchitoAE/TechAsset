using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using TechAsset.Pruebas.Dobles;
using TechAsset.WebApi.Seguridad;

namespace TechAsset.Pruebas.WebApi;

// Endurecimiento del ingreso: a la sexta contraseña equivocada la API responde 429 con un mensaje
// en español y sin revelar si el correo existe.
public class PruebasDeIngresoEndurecido(FabricaDePruebasDeAcceso fabrica)
    : IClassFixture<FabricaDePruebasDeAcceso>
{
    [Fact]
    public async Task TrasCincoFallosElSextoIntentoResponde429()
    {
        var cliente = fabrica.CreateClient();

        for (var intento = 0; intento < LimiteDeIntentosDeIngreso.FallosPermitidos; intento++)
        {
            var fallido = await cliente.PostAsJsonAsync("/api/autenticacion/ingreso", new
            {
                correo_usuario = FabricaDePruebasDeAcceso.Correo,
                contrasena = $"ClaveEquivocada{intento}"
            });

            Assert.Equal(HttpStatusCode.Unauthorized, fallido.StatusCode);
        }

        var bloqueado = await cliente.PostAsJsonAsync("/api/autenticacion/ingreso", new
        {
            correo_usuario = FabricaDePruebasDeAcceso.Correo,
            contrasena = FabricaDeUsuarios.ContrasenaDePrueba
        });

        Assert.Equal(HttpStatusCode.TooManyRequests, bloqueado.StatusCode);
        Assert.Equal(
            LimiteDeIntentosDeIngreso.SegundosDeBloqueo.ToString(),
            bloqueado.Headers.GetValues("Retry-After").Single());

        var cuerpo = await bloqueado.Content.ReadAsStringAsync();
        using var documento = JsonDocument.Parse(cuerpo);
        Assert.False(documento.RootElement.GetProperty("success").GetBoolean());
        Assert.Equal(
            FiltroDeIntentosDeIngreso.MensajeDeBloqueo,
            documento.RootElement.GetProperty("message").GetString());
        Assert.DoesNotContain(FabricaDePruebasDeAcceso.Correo, cuerpo);
    }

    [Fact]
    public async Task ElCorreoInexistenteRecibeElMismoMensajeYNoSeRevela()
    {
        var cliente = fabrica.CreateClient();
        const string correo = "otra.persona@innovatech.pe";

        // La cuenta sembrada es ana.perez; este correo no existe, pero la respuesta es la misma que
        // una contraseña equivocada y no confirma ni niega la existencia de la cuenta.
        var fallido = await cliente.PostAsJsonAsync("/api/autenticacion/ingreso", new
        {
            correo_usuario = correo,
            contrasena = "ClaveEquivocada1"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, fallido.StatusCode);
        var cuerpo = await fallido.Content.ReadAsStringAsync();
        Assert.Contains("El correo o la contraseña no son correctos.", cuerpo);
        Assert.DoesNotContain(correo, cuerpo);
    }
}
