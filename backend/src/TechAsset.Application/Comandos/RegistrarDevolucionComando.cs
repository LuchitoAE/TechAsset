using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Comandos;

// RF-10 y RN-10: devolución de un préstamo activo con observaciones obligatorias.
public sealed record RegistrarDevolucionComando(
    Guid IdPrestamo,
    string? ObservacionPrestamo,
    RolUsuario RolSesion);
