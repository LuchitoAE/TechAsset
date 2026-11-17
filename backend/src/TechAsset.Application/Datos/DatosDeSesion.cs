using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Datos;

// Datos mínimos de la sesión: lo que la SPA necesita para mostrar el nombre y armar el menú por rol.
public sealed record DatosDeSesion(
    Guid IdUsuario,
    string NombresUsuario,
    string ApellidosUsuario,
    string CorreoUsuario,
    RolUsuario RolUsuario)
{
    public static DatosDeSesion Desde(Usuario usuario) => new(
        usuario.IdUsuario,
        usuario.NombresUsuario,
        usuario.ApellidosUsuario,
        usuario.CorreoUsuario.Valor,
        usuario.RolUsuario);
}
