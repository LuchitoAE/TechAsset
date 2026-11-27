using System.Text.Json.Serialization;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Datos;

// Detalle de un préstamo (RF-11). Incluye el equipo, el responsable con su área, las fechas, el
// estado, el vencimiento y las observaciones o el motivo del rechazo. Las fechas de devolución usan
// los nombres de columna del SDD (fecha_devolucion y fecha_devolucion_real).
public sealed record DetalleDePrestamo(
    Guid IdPrestamo,
    Guid IdEquipo,
    string CodigoPatrimonialEquipo,
    string NombreEquipo,
    Guid IdUsuario,
    string NombreResponsable,
    string CorreoResponsable,
    string AreaResponsable,
    DateOnly? FechaPrestamo,
    [property: JsonPropertyName("fecha_devolucion")] DateOnly FechaDevolucionPrestamo,
    [property: JsonPropertyName("fecha_devolucion_real")] DateOnly? FechaDevolucionRealPrestamo,
    EstadoPrestamo EstadoPrestamo,
    bool VencidoPrestamo,
    string? ObservacionPrestamo,
    string? MotivoRechazoPrestamo)
{
    public static DetalleDePrestamo Desde(Prestamo prestamo, DateOnly hoy) => new(
        prestamo.IdPrestamo,
        prestamo.IdEquipo,
        prestamo.Equipo.CodigoPatrimonial.Valor,
        prestamo.Equipo.NombreEquipo,
        prestamo.IdUsuario,
        prestamo.Responsable.NombreCompleto,
        prestamo.Responsable.CorreoUsuario.Valor,
        prestamo.Responsable.AreaUsuario,
        prestamo.Periodo.FechaPrestamo,
        prestamo.Periodo.FechaDevolucionPrestamo,
        prestamo.FechaDevolucionRealPrestamo,
        prestamo.EstadoPrestamo,
        prestamo.EstaVencido(hoy),
        prestamo.ObservacionPrestamo,
        prestamo.MotivoRechazoPrestamo);
}
