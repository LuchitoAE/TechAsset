using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Datos;

// Cuántos equipos hay en un estado con los filtros activos. Alimenta los chips del inventario.
public sealed record ConteoDeEstadoEquipo(EstadoEquipo EstadoEquipo, int Total);

// Página del inventario: total filtrado, conteo por estado y los equipos de la página.
public sealed record PaginaDeEquipos(
    int Total,
    int Pagina,
    int Tamano,
    IReadOnlyList<ConteoDeEstadoEquipo> ConteoPorEstado,
    IReadOnlyList<DatosDeEquipo> Equipos);
