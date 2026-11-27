using TechAsset.Domain.Enumeraciones;

namespace TechAsset.WebApi.Contratos;

/// <summary>Datos para actualizar un usuario (RF-02). La contraseña solo cambia si se envía.</summary>
public sealed record ActualizarUsuarioSolicitud(
    string? NombresUsuario,
    string? ApellidosUsuario,
    string? CorreoUsuario,
    string? AreaUsuario,
    RolUsuario? RolUsuario,
    string? ContrasenaNueva);
