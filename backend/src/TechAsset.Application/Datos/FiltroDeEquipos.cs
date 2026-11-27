using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Datos;

// Filtros de RF-07: estado, categoría, marca y texto (código, nombre o marca), con paginación.
public sealed record FiltroDeEquipos(
    string? Texto,
    EstadoEquipo? Estado,
    CategoriaEquipo? Categoria,
    string? Marca,
    int Pagina,
    int Tamano)
{
    public const int TamanoPredeterminado = 20;
    public const int TamanoMaximo = 100;

    public static FiltroDeEquipos Normalizar(
        string? texto,
        EstadoEquipo? estado,
        CategoriaEquipo? categoria,
        string? marca,
        int pagina,
        int tamano) => new(
            string.IsNullOrWhiteSpace(texto) ? null : texto.Trim(),
            estado,
            categoria,
            string.IsNullOrWhiteSpace(marca) ? null : marca.Trim(),
            pagina < 1 ? 1 : pagina,
            tamano is < 1 or > TamanoMaximo ? TamanoPredeterminado : tamano);
}
