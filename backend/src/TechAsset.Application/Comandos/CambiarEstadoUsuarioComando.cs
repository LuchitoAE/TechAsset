using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Comandos;

// Datos de entrada de RF-04. El rol de la sesión viaja para que el caso de uso vuelva a comprobar RN-09,
// aunque la API ya limite el endpoint al Administrador.
public sealed record CambiarEstadoUsuarioComando(
    Guid IdUsuario,
    bool ActivoUsuario,
    Guid IdUsuarioSesion,
    RolUsuario RolSesion);
