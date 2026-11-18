namespace TechAsset.Application;

// Convierte un rango de días de America/Lima al intervalo UTC que se compara con las marcas de
// tiempo de la base (fecha_movimiento). El fin es exclusivo: el día «hasta» entra completo.
public static class RangoDeFechas
{
    private static readonly TimeZoneInfo ZonaDeLima =
        TimeZoneInfo.FindSystemTimeZoneById("America/Lima");

    public static (DateTimeOffset? Desde, DateTimeOffset? HastaExclusivo) DelDia(
        DateOnly? desde,
        DateOnly? hasta)
    {
        var inicio = desde is { } primerDia ? InicioDelDia(primerDia) : (DateTimeOffset?)null;
        var fin = hasta is { } ultimoDia ? InicioDelDia(ultimoDia.AddDays(1)) : (DateTimeOffset?)null;

        return (inicio, fin);
    }

    private static DateTimeOffset InicioDelDia(DateOnly fecha)
    {
        var medianoche = fecha.ToDateTime(TimeOnly.MinValue);
        var desplazamiento = ZonaDeLima.GetUtcOffset(medianoche);
        return new DateTimeOffset(medianoche, desplazamiento).ToUniversalTime();
    }
}
