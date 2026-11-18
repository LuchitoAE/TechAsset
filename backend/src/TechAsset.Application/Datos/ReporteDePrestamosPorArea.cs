namespace TechAsset.Application.Datos;

// Fila del reporte de préstamos por área (RF-16): el área del responsable, cuántos préstamos
// contados tiene en el periodo y su porcentaje sobre el total. Las áreas sin préstamos llegan en
// cero para que el reporte muestre el catálogo completo (D-09).
public sealed record DatosDePrestamosPorArea(
    string AreaResponsable,
    int TotalPrestamos,
    decimal PorcentajePrestamos);

// Reporte completo: total del periodo y las filas por área, de mayor a menor.
public sealed record ReporteDePrestamosPorArea(
    int TotalPrestamos,
    IReadOnlyList<DatosDePrestamosPorArea> Areas);
