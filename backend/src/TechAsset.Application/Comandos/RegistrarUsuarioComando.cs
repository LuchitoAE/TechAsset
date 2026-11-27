using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Comandos;

// Datos de entrada de RF-01. La contraseña es la inicial; se guarda solo su sal y su hash.
public sealed record RegistrarUsuarioComando(
    string? NombresUsuario,
    string? ApellidosUsuario,
    string? CorreoUsuario,
    string? AreaUsuario,
    RolUsuario RolUsuario,
    string? Contrasena);
