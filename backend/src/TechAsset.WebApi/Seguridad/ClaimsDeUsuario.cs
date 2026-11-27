using System.Security.Claims;
using TechAsset.Application.Datos;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;

namespace TechAsset.WebApi.Seguridad;

// Traduce los datos de la sesión a los claims de la cookie y de vuelta. El identificador y el rol se
// leen de la base en cada petición (RNF-18).
public static class ClaimsDeUsuario
{
    public static ClaimsIdentity Crear(DatosDeSesion sesion) => new(
        [
            new Claim(ClaimTypes.NameIdentifier, sesion.IdUsuario.ToString()),
            new Claim(ClaimTypes.Name, $"{sesion.NombresUsuario} {sesion.ApellidosUsuario}".Trim()),
            new Claim(ClaimTypes.Email, sesion.CorreoUsuario),
            new Claim(ClaimTypes.Role, sesion.RolUsuario.ToString())
        ],
        authenticationType: "TechAssetCookie");

    public static Guid IdUsuario(ClaimsPrincipal principal)
    {
        var valor = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(valor, out var idUsuario)
            ? idUsuario
            : throw new NoAutenticadoExcepcion();
    }

    public static RolUsuario Rol(ClaimsPrincipal principal)
    {
        var valor = principal.FindFirst(ClaimTypes.Role)?.Value;
        return Enum.TryParse<RolUsuario>(valor, ignoreCase: false, out var rol)
            ? rol
            : throw new NoAutenticadoExcepcion();
    }
}
