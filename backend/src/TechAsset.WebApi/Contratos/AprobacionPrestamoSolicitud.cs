namespace TechAsset.WebApi.Contratos;

/// <summary>
/// Decisión sobre una solicitud de préstamo (RF-09): aprobado_prestamo en true la aprueba; en false
/// la rechaza y entonces el motivo es obligatorio.
/// </summary>
public sealed record AprobacionPrestamoSolicitud(
    bool? AprobadoPrestamo,
    string? MotivoRechazoPrestamo);
