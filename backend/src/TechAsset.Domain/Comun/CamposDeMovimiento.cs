namespace TechAsset.Domain.Comun;

// Nombres de los campos del movimiento tal como viajan en el JSON y en los errores por campo
// (snake_case). Se usan en un solo lugar para que el dominio y la API hablen el mismo idioma.
public static class CamposDeMovimiento
{
    public const string IdMovimiento = "id_movimiento";
    public const string TipoMovimiento = "tipo_movimiento";
    public const string FechaMovimiento = "fecha_movimiento";
    public const string IdEquipo = "id_equipo";
    public const string IdUsuario = "id_usuario";
    public const string DetalleMovimiento = "detalle_movimiento";
}
