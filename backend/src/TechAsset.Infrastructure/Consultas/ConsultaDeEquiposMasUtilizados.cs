using Microsoft.EntityFrameworkCore;
using TechAsset.Application;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Infrastructure.Persistencia;

namespace TechAsset.Infrastructure.Consultas;

// Ranking de equipos más utilizados (RF-15). Cuenta los préstamos Activos y Devueltos (D-09), ordena
// por cantidad y código, recorta al límite y consulta en una segunda pasada las áreas que usaron los
// equipos elegidos, para no traer todos los préstamos del historial.
public sealed class ConsultaDeEquiposMasUtilizados(ContextoDeTechAsset contexto)
    : IConsultaDeEquiposMasUtilizados
{
    public async Task<IReadOnlyList<DatosDeEquipoMasUtilizado>> ObtenerAsync(
        FiltroDeEquiposMasUtilizados filtro,
        CancellationToken cancellationToken = default)
    {
        var conteos = contexto.Prestamos
            .AsNoTracking()
            .Where(prestamo =>
                prestamo.EstadoPrestamo == EstadoPrestamo.Activo
                || prestamo.EstadoPrestamo == EstadoPrestamo.Devuelto)
            .GroupBy(prestamo => prestamo.IdEquipo)
            .Select(grupo => new { IdEquipo = grupo.Key, Total = grupo.Count() });

        var ranking = await (
                from conteo in conteos
                join equipo in contexto.Equipos.AsNoTracking()
                    on conteo.IdEquipo equals equipo.IdEquipo
                orderby conteo.Total descending, equipo.CodigoPatrimonial.Valor
                select new
                {
                    equipo.IdEquipo,
                    CodigoPatrimonialEquipo = equipo.CodigoPatrimonial.Valor,
                    equipo.NombreEquipo,
                    equipo.CategoriaEquipo,
                    conteo.Total
                })
            .Take(filtro.Limite)
            .ToListAsync(cancellationToken);

        var ids = ranking.Select(fila => fila.IdEquipo).ToList();

        var areas = await contexto.Prestamos
            .AsNoTracking()
            .Where(prestamo =>
                ids.Contains(prestamo.IdEquipo)
                && (prestamo.EstadoPrestamo == EstadoPrestamo.Activo
                    || prestamo.EstadoPrestamo == EstadoPrestamo.Devuelto))
            .GroupBy(prestamo => new { prestamo.IdEquipo, prestamo.Responsable.AreaUsuario })
            .Select(grupo => new
            {
                grupo.Key.IdEquipo,
                grupo.Key.AreaUsuario,
                Total = grupo.Count()
            })
            .ToListAsync(cancellationToken);

        var filas = ranking
            .Select(fila => new DatosDeEquipoMasUtilizado(
                fila.IdEquipo,
                fila.CodigoPatrimonialEquipo,
                fila.NombreEquipo,
                fila.CategoriaEquipo,
                fila.Total,
                ReglasDeReportes.AreasConMayorUso(
                    areas
                        .Where(area => area.IdEquipo == fila.IdEquipo)
                        .Select(area => new ConteoDePrestamosPorArea(area.AreaUsuario, area.Total)))))
            .ToList();

        return ReglasDeReportes.OrdenarRanking(filas, filtro.Limite);
    }
}
