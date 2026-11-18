namespace TechAsset.Domain.Comun;

// Nombres de los campos del préstamo tal como viajan en el JSON y en los errores por campo
// (snake_case). Se usan en un solo lugar para que el dominio y la API hablen el mismo idioma.
public static class CamposDePrestamo
{
    public const string IdPrestamo = "id_prestamo";
    public const string IdEquipo = "id_equipo";
    public const string IdUsuario = "id_usuario";
    public const string FechaPrestamo = "fecha_prestamo";
    public const string FechaDevolucionPrestamo = "fecha_devolucion";
    public const string FechaDevolucionRealPrestamo = "fecha_devolucion_real";
    public const string ObservacionPrestamo = "observacion_prestamo";
    public const string MotivoRechazoPrestamo = "motivo_rechazo_prestamo";
    public const string EstadoPrestamo = "estado_prestamo";
    public const string VencidoPrestamo = "vencido_prestamo";
}
