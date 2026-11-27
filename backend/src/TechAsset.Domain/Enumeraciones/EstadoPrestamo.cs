namespace TechAsset.Domain.Enumeraciones;

// Estados de un préstamo (D-05): nace Solicitado, el Responsable de Tecnología lo deja Activo o
// Rechazado, y un préstamo Activo termina en Devuelto con la devolución. Devuelto y Rechazado son
// finales; un equipo solo puede estar en un préstamo Activo a la vez (RN-01).
public enum EstadoPrestamo
{
    Solicitado,
    Activo,
    Devuelto,
    Rechazado
}
