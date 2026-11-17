using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Datos;

// Vista de un usuario para la API: nunca se devuelve la entidad ni la contraseña.
public sealed record DatosDeUsuario(
    Guid IdUsuario,
    string NombresUsuario,
    string ApellidosUsuario,
    string CorreoUsuario,
    string AreaUsuario,
    RolUsuario RolUsuario,
    bool ActivoUsuario)
{
    public static DatosDeUsuario Desde(Usuario usuario) => new(
        usuario.IdUsuario,
        usuario.NombresUsuario,
        usuario.ApellidosUsuario,
        usuario.CorreoUsuario.Valor,
        usuario.AreaUsuario,
        usuario.RolUsuario,
        usuario.ActivoUsuario);
}
