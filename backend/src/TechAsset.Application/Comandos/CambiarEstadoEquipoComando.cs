using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Comandos;

// Datos de entrada de RF-08. El rol de la sesión viaja para que el caso de uso vuelva a comprobar
// que solo el Administrador o el Responsable de Tecnología cambian el estado.
public sealed record CambiarEstadoEquipoComando(
    Guid IdEquipo,
    EstadoEquipo EstadoEquipo,
    Guid IdUsuarioSesion,
    RolUsuario RolSesion);
