using System.Text.Json.Serialization;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Datos;

// Fila del historial de préstamos (RF-11) y de los préstamos activos (RF-12). El vencimiento se
// calcula al consultar: no se guarda un estado «Vencido» (SDD, vista de algoritmo). Las fechas
// usan los nombres de columna del SDD (fecha_devolucion y fecha_devolucion_real).
public sealed record DatosDePrestamo(
    Guid IdPrestamo,
    string CodigoPatrimonialEquipo,
    string NombreEquipo,
    string NombreResponsable,
    string AreaResponsable,
    DateOnly? FechaPrestamo,
    [property: JsonPropertyName("fecha_devolucion")] DateOnly FechaDevolucionPrestamo,
    [property: JsonPropertyName("fecha_devolucion_real")] DateOnly? FechaDevolucionRealPrestamo,
    EstadoPrestamo EstadoPrestamo,
    bool VencidoPrestamo);
