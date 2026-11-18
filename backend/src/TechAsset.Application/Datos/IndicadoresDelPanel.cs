using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Datos;

// Indicadores mínimos del panel (RF-13, D-10): total de equipos, disponibles, prestados, en
// mantenimiento, total de préstamos y el área o las áreas con mayor uso (D-09: si hay empate se
// muestran todas). La fecha de corte permite saber cuándo se calcularon.
public sealed record IndicadoresDelPanel(
    int TotalEquipos,
    int EquiposDisponibles,
    int EquiposPrestados,
    int EquiposMantenimiento,
    int TotalPrestamos,
    IReadOnlyList<string> AreasConMayorUso,
    DateTimeOffset FechaCorte)
{
    // Compone los seis indicadores a partir del conteo por estado y de los préstamos contados.
    // El total de equipos suma los cuatro estados, incluido Baja, para que no se pierda ningún
    // equipo del inventario (RF-14: la suma de los estados coincide con el total).
    public static IndicadoresDelPanel Desde(
        IEnumerable<ConteoDeEstadoEquipo> conteoPorEstado,
        int totalPrestamos,
        IReadOnlyList<string> areasConMayorUso,
        DateTimeOffset fechaCorte)
    {
        var conteos = conteoPorEstado.ToDictionary(conteo => conteo.EstadoEquipo, conteo => conteo.Total);

        return new IndicadoresDelPanel(
            conteos.Values.Sum(),
            conteos.GetValueOrDefault(EstadoEquipo.Disponible),
            conteos.GetValueOrDefault(EstadoEquipo.Prestado),
            conteos.GetValueOrDefault(EstadoEquipo.Mantenimiento),
            totalPrestamos,
            areasConMayorUso,
            fechaCorte);
    }
}
