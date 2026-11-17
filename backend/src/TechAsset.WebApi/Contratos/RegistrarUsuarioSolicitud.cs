using TechAsset.Domain.Enumeraciones;

namespace TechAsset.WebApi.Contratos;

/// <summary>Datos para registrar un usuario (RF-01).</summary>
public sealed record RegistrarUsuarioSolicitud(
    string? NombresUsuario,
    string? ApellidosUsuario,
    string? CorreoUsuario,
    string? AreaUsuario,
    RolUsuario? RolUsuario,
    string? Contrasena);
