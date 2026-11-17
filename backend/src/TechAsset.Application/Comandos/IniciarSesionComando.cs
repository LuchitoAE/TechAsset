namespace TechAsset.Application.Comandos;

// Datos de entrada de RN-11: correo y contraseña, sin decir cuál falló si no coinciden.
public sealed record IniciarSesionComando(string? CorreoUsuario, string? Contrasena);
