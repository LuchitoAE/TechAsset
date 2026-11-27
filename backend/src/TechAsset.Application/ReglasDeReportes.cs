using TechAsset.Application.Datos;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application;

// Reglas puras de los reportes (RF-13 a RF-17, D-09). Se separan de las consultas para poder
// probarlas sin base de datos: empates de área, orden del ranking, porcentajes y suma de estados.
public static class ReglasDeReportes
{
    // D-09: si varias áreas alcanzan el máximo, se muestran todas. Sin préstamos, no hay área.
    public static IReadOnlyList<string> AreasConMayorUso(
        IEnumerable<ConteoDePrestamosPorArea> conteos)
    {
        var conPrestamos = conteos
            .Where(conteo => conteo.TotalPrestamos > 0)
            .ToList();

        if (conPrestamos.Count == 0)
        {
            return [];
        }

        var maximo = conPrestamos.Max(conteo => conteo.TotalPrestamos);

        return conPrestamos
            .Where(conteo => conteo.TotalPrestamos == maximo)
            .Select(conteo => conteo.AreaResponsable)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(area => area, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    // RF-15: de mayor a menor cantidad de préstamos y, si hay empate, alfabético por código
    // patrimonial (D-09). Después se recorta al límite pedido.
    public static IReadOnlyList<DatosDeEquipoMasUtilizado> OrdenarRanking(
        IEnumerable<DatosDeEquipoMasUtilizado> filas,
        int limite) =>
        filas
            .OrderByDescending(fila => fila.TotalPrestamos)
            .ThenBy(fila => fila.CodigoPatrimonialEquipo, StringComparer.Ordinal)
            .Take(limite)
            .ToList();

    // RF-16: todas las áreas conocidas aparecen, aunque no tengan préstamos; el porcentaje se
    // calcula sobre el total del periodo y se redondea a un decimal.
    public static ReporteDePrestamosPorArea CompletarAreas(
        IEnumerable<string> areasConocidas,
        IEnumerable<ConteoDePrestamosPorArea> conteos)
    {
        var porArea = conteos
            .GroupBy(conteo => conteo.AreaResponsable, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                grupo => grupo.Key,
                grupo => grupo.Sum(conteo => conteo.TotalPrestamos),
                StringComparer.OrdinalIgnoreCase);

        var areas = areasConocidas
            .Concat(porArea.Keys)
            .Where(area => !string.IsNullOrWhiteSpace(area))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var total = porArea.Values.Sum();

        var filas = areas
            .Select(area =>
            {
                var cantidad = porArea.GetValueOrDefault(area);
                var porcentaje = total == 0
                    ? 0m
                    : Math.Round(cantidad * 100m / total, 1, MidpointRounding.AwayFromZero);

                return new DatosDePrestamosPorArea(area, cantidad, porcentaje);
            })
            .OrderByDescending(fila => fila.TotalPrestamos)
            .ThenBy(fila => fila.AreaResponsable, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return new ReporteDePrestamosPorArea(total, filas);
    }

    // RF-14: los cuatro estados aparecen siempre, en el orden del catálogo, y la suma de sus totales
    // coincide con el total general del reporte.
    public static ReporteDeEquiposPorEstado AgruparPorEstado(IEnumerable<DatosDeEquipo> equipos)
    {
        var lista = equipos.ToList();

        var estados = Enum.GetValues<EstadoEquipo>()
            .OrderBy(estado => (int)estado)
            .Select(estado =>
            {
                var delEstado = lista
                    .Where(equipo => equipo.EstadoEquipo == estado)
                    .OrderBy(equipo => equipo.CodigoPatrimonialEquipo, StringComparer.Ordinal)
                    .ToList();

                return new GrupoDeEquiposPorEstado(estado, delEstado.Count, delEstado);
            })
            .ToList();

        return new ReporteDeEquiposPorEstado(lista.Count, estados);
    }
}
