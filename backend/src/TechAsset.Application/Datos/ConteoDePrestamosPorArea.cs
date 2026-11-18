namespace TechAsset.Application.Datos;

// Conteo de préstamos contados (Activos y Devueltos, D-09) por área del responsable. Es la materia
// prima de los indicadores y del reporte de áreas; las reglas puras viven en ReglasDeReportes.
public sealed record ConteoDePrestamosPorArea(string AreaResponsable, int TotalPrestamos);
