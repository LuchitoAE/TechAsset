namespace TechAsset.Domain.Comun;

// Nombres de los campos del equipo tal como viajan en el JSON y en los errores por campo
// (snake_case). Se usan en un solo lugar para que el dominio y la API hablen el mismo idioma.
public static class CamposDeEquipo
{
    public const string IdEquipo = "id_equipo";
    public const string CodigoPatrimonialEquipo = "codigo_patrimonial_equipo";
    public const string NombreEquipo = "nombre_equipo";
    public const string CategoriaEquipo = "categoria_equipo";
    public const string MarcaEquipo = "marca_equipo";
    public const string EstadoEquipo = "estado_equipo";
    public const string DisponibleEquipo = "disponible_equipo";
}
