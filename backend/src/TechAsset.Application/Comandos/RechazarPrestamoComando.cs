using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Comandos;

// RF-09: rechazo de una solicitud con su motivo.
public sealed record RechazarPrestamoComando(
    Guid IdPrestamo,
    string? MotivoRechazoPrestamo,
    RolUsuario RolSesion);
