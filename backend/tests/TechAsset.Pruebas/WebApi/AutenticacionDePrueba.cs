using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace TechAsset.Pruebas.WebApi;

// Esquema de autenticación de prueba: simula una sesión según el encabezado X-Prueba-Rol, sin cookie
// ni base de datos. Sirve para comprobar 401 y 403 en la API.
public sealed class AutenticacionDePrueba(
    IOptionsMonitor<AuthenticationSchemeOptions> opciones,
    ILoggerFactory fabricaDeRegistros,
    UrlEncoder codificador)
    : AuthenticationHandler<AuthenticationSchemeOptions>(opciones, fabricaDeRegistros, codificador)
{
    public const string EncabezadoDeRol = "X-Prueba-Rol";
    public const string Esquema = "Prueba";

    // Identificador fijo del usuario de prueba: permite sembrar préstamos propios y ajenos sin
    // depender de un valor aleatorio en cada petición.
    public static readonly Guid IdUsuarioDePrueba = Guid.Parse("11111111-1111-1111-1111-111111111111");

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(EncabezadoDeRol, out var rol)
            || string.IsNullOrWhiteSpace(rol))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var identidad = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, IdUsuarioDePrueba.ToString()),
                new Claim(ClaimTypes.Name, "Usuario de prueba"),
                new Claim(ClaimTypes.Role, rol.ToString())
            ],
            Esquema);

        var boleto = new AuthenticationTicket(new ClaimsPrincipal(identidad), Esquema);
        return Task.FromResult(AuthenticateResult.Success(boleto));
    }

    protected override async Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = StatusCodes.Status401Unauthorized;
        Response.ContentType = "application/problem+json";
        await Response.WriteAsJsonAsync(new
        {
            status = StatusCodes.Status401Unauthorized,
            title = "No autorizado",
            success = false,
            message = "Debe iniciar sesión."
        });
    }

    protected override async Task HandleForbiddenAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = StatusCodes.Status403Forbidden;
        Response.ContentType = "application/problem+json";
        await Response.WriteAsJsonAsync(new
        {
            status = StatusCodes.Status403Forbidden,
            title = "Acceso denegado",
            success = false,
            message = "Su rol no permite esta operación."
        });
    }
}
