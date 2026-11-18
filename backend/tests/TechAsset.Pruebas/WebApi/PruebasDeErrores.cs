using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using TechAsset.Domain.Excepciones;
using TechAsset.WebApi.Middleware;

namespace TechAsset.Pruebas.WebApi;

// RNF-02 y RNF-19: un error no controlado nunca devuelve el mensaje técnico ni datos personales;
// la respuesta es el mensaje general en español.
public class PruebasDeErrores
{
    [Fact]
    public async Task UnErrorNoControladoNoFiltraDatosPersonales()
    {
        var contexto = new DefaultHttpContext();
        contexto.Request.Path = "/api/usuarios";
        contexto.Response.Body = new MemoryStream();

        var manejador = new ManejadorDeErrores(NullLogger<ManejadorDeErrores>.Instance);
        var excepcion = new InvalidOperationException(
            "Falla con ana.perez@innovatech.pe, DNI 12345678 y Password=secreto");

        var manejado = await manejador.TryHandleAsync(contexto, excepcion, CancellationToken.None);

        Assert.True(manejado);
        Assert.Equal(StatusCodes.Status500InternalServerError, contexto.Response.StatusCode);

        contexto.Response.Body.Seek(0, SeekOrigin.Begin);
        var cuerpo = await new StreamReader(contexto.Response.Body, Encoding.UTF8).ReadToEndAsync();

        Assert.DoesNotContain("ana.perez@innovatech.pe", cuerpo);
        Assert.DoesNotContain("12345678", cuerpo);
        Assert.DoesNotContain("secreto", cuerpo);
        Assert.Contains("No se pudo completar la operación. Intente nuevamente.", cuerpo);
    }

    [Fact]
    public async Task LasCredencialesInvalidasNoRevelanCualDatoFallo()
    {
        var contexto = new DefaultHttpContext();
        contexto.Request.Path = "/api/autenticacion/ingreso";
        contexto.Response.Body = new MemoryStream();

        var manejador = new ManejadorDeErrores(NullLogger<ManejadorDeErrores>.Instance);

        await manejador.TryHandleAsync(
            contexto,
            new CredencialesInvalidasExcepcion(),
            CancellationToken.None);

        contexto.Response.Body.Seek(0, SeekOrigin.Begin);
        var cuerpo = await new StreamReader(contexto.Response.Body, Encoding.UTF8).ReadToEndAsync();

        Assert.Equal(StatusCodes.Status401Unauthorized, contexto.Response.StatusCode);
        Assert.Contains("El correo o la contraseña no son correctos.", cuerpo);
        Assert.DoesNotContain("deshabilitado", cuerpo, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("no existe", cuerpo, StringComparison.OrdinalIgnoreCase);
    }
}
