namespace TechAsset.Application.Datos;

// Filtro de RF-16: rango de fechas de préstamo del periodo consultado. Sin fechas se cuenta todo el
// historial. La validación de que «desde» no supere a «hasta» la hace el caso de uso.
public sealed record FiltroDePrestamosPorArea(DateOnly? Desde, DateOnly? Hasta)
{
    public static FiltroDePrestamosPorArea Normalizar(DateOnly? desde, DateOnly? hasta) =>
        new(desde, hasta);
}
