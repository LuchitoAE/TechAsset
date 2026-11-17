namespace TechAsset.Domain.Enumeraciones;

// Estados de un equipo. Disponible, Mantenimiento y Baja se cambian con RF-08; Prestado lo pone y
// lo retira el sistema con el préstamo activo (RN-01, D-05).
public enum EstadoEquipo
{
    Disponible,
    Prestado,
    Mantenimiento,
    Baja
}
