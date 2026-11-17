namespace TechAsset.Domain.Comun;

// Nombres de los campos tal como viajan en el JSON y en los errores por campo (snake_case).
// Se usan en un solo lugar para que el dominio y la API hablen el mismo idioma.
public static class CamposDeUsuario
{
    public const string IdUsuario = "id_usuario";
    public const string NombresUsuario = "nombres_usuario";
    public const string ApellidosUsuario = "apellidos_usuario";
    public const string CorreoUsuario = "correo_usuario";
    public const string AreaUsuario = "area_usuario";
    public const string RolUsuario = "rol_usuario";
    public const string ActivoUsuario = "activo_usuario";
    public const string Contrasena = "contrasena";
}
