using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Comandos;

// RF-09: datos de la solicitud de préstamo. El responsable es el colaborador de la sesión (RN-05).
public sealed record SolicitarPrestamoComando(
    Guid? IdEquipo,
    DateOnly? FechaDevolucionPrestamo,
    Guid IdUsuarioSesion,
    RolUsuario RolSesion);
