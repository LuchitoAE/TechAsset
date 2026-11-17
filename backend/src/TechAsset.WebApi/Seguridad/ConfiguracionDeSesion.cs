using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;
using TechAsset.WebApi.Respuestas;

namespace TechAsset.WebApi.Seguridad;

// Configura la sesión: cookie HttpOnly, SameSite=Strict, 8 horas con renovación deslizante (RNF-17).
// En cada petición se vuelve a leer el usuario para que un deshabilitado pierda el acceso y el rol
// siempre sea el de la base (RNF-18).
public static class ConfiguracionDeSesion
{
    public const string NombreDeLaCookie = "techasset_sesion";

    public static IServiceCollection AgregarSesionDeTechAsset(this IServiceCollection servicios)
    {
        servicios
            .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(opciones =>
            {
                opciones.Cookie.Name = NombreDeLaCookie;
                opciones.Cookie.HttpOnly = true;
                opciones.Cookie.SameSite = SameSiteMode.Strict;
                opciones.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                opciones.Cookie.Path = "/";
                opciones.ExpireTimeSpan = TimeSpan.FromHours(8);
                opciones.SlidingExpiration = true;
                opciones.Events = new CookieAuthenticationEvents
                {
                    OnValidatePrincipal = ValidarSesionAsync,
                    OnRedirectToLogin = contexto =>
                        RespuestasDeError.EscribirAsync(
                            contexto.HttpContext,
                            StatusCodes.Status401Unauthorized,
                            "No autorizado",
                            "Debe iniciar sesión."),
                    OnRedirectToAccessDenied = contexto =>
                        RespuestasDeError.EscribirAsync(
                            contexto.HttpContext,
                            StatusCodes.Status403Forbidden,
                            "Acceso denegado",
                            "Su rol no permite esta operación.")
                };
            });

        return servicios;
    }

    private static async Task ValidarSesionAsync(CookieValidatePrincipalContext contexto)
    {
        var valor = contexto.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(valor, out var idUsuario))
        {
            contexto.RejectPrincipal();
            await contexto.HttpContext.SignOutAsync();
            return;
        }

        var repositorio = contexto.HttpContext.RequestServices
            .GetRequiredService<IRepositorioDeUsuarios>();

        var usuario = await repositorio.ObtenerPorIdAsync(idUsuario);

        if (usuario is null || !usuario.PuedeIngresar)
        {
            contexto.RejectPrincipal();
            await contexto.HttpContext.SignOutAsync();
            return;
        }

        var identidad = ClaimsDeUsuario.Crear(new(
            usuario.IdUsuario,
            usuario.NombresUsuario,
            usuario.ApellidosUsuario,
            usuario.CorreoUsuario.Valor,
            usuario.RolUsuario));

        contexto.ReplacePrincipal(new System.Security.Claims.ClaimsPrincipal(identidad));
    }
}

// Nombres de los roles tal como se usan en [Authorize(Roles = ...)] y en las políticas.
public static class PoliticasDeAcceso
{
    public const string Administrador = nameof(RolUsuario.Administrador);
    public const string ResponsableDeTecnologia = nameof(RolUsuario.ResponsableDeTecnologia);
    public const string Colaborador = nameof(RolUsuario.Colaborador);
}
