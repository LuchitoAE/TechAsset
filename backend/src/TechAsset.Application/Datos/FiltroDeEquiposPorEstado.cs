using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Datos;

// Filtros de RF-14: categoría, marca y texto (código, nombre o marca). El reporte muestra los cuatro
// estados y la suma coincide con el total del inventario filtrado.
public sealed record FiltroDeEquiposPorEstado(
    string? Texto,
    CategoriaEquipo? Categoria,
    string? Marca)
{
    public static FiltroDeEquiposPorEstado Normalizar(
        string? texto,
        CategoriaEquipo? categoria,
        string? marca) => new(
            string.IsNullOrWhiteSpace(texto) ? null : texto.Trim(),
            categoria,
            string.IsNullOrWhiteSpace(marca) ? null : marca.Trim());
}
