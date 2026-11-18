namespace TechAsset.Domain.Enumeraciones;

// Tipos de movimiento del historial (RF-17, D-03). Cada hecho que cambia el inventario o un
// préstamo deja un movimiento con su tipo, su fecha, el equipo, el usuario que lo hizo y un
// detalle legible.
public enum TipoMovimiento
{
    EquipoRegistrado,
    EquipoActualizado,
    EquipoEstadoCambiado,
    PrestamoSolicitado,
    PrestamoAprobado,
    PrestamoRechazado,
    PrestamoDevuelto
}
