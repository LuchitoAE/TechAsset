using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Comandos;

// Datos de entrada de RF-02. Si ContrasenaNueva llega vacía, la contraseña actual se conserva.
public sealed record ActualizarUsuarioComando(
    Guid IdUsuario,
    string? NombresUsuario,
    string? ApellidosUsuario,
    string? CorreoUsuario,
    string? AreaUsuario,
    RolUsuario RolUsuario,
    string? ContrasenaNueva);
