namespace TechAsset.Application.Datos;

// Página del historial de préstamos: total filtrado y los préstamos de la página.
public sealed record PaginaDePrestamos(
    int Total,
    int Pagina,
    int Tamano,
    IReadOnlyList<DatosDePrestamo> Prestamos);
