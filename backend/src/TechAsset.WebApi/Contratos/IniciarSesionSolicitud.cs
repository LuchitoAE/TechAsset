namespace TechAsset.WebApi.Contratos;

/// <summary>Credenciales del ingreso con correo y contraseña (RN-11).</summary>
public sealed record IniciarSesionSolicitud(string? CorreoUsuario, string? Contrasena);
