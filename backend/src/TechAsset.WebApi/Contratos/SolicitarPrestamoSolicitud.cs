using System.Text.Json.Serialization;

namespace TechAsset.WebApi.Contratos;

/// <summary>
/// Datos para solicitar un préstamo (RF-09). El responsable es el colaborador de la sesión, por eso
/// no viaja en el cuerpo; la fecha de devolución es la comprometida (RN-04).
/// </summary>
public sealed record SolicitarPrestamoSolicitud(
    Guid? IdEquipo,
    [property: JsonPropertyName("fecha_devolucion")] DateOnly? FechaDevolucionPrestamo);
