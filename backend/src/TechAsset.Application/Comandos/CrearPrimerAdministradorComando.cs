namespace TechAsset.Application.Comandos;

// Datos del primer Administrador, leídos de la configuración segura (user-secrets), nunca del repositorio.
public sealed record CrearPrimerAdministradorComando(
    string? NombresUsuario,
    string? ApellidosUsuario,
    string? CorreoUsuario,
    string? AreaUsuario,
    string? Contrasena);
