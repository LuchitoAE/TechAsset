using Microsoft.EntityFrameworkCore;
using TechAsset.Application;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Infrastructure.Persistencia;

namespace TechAsset.Infrastructure.Consultas;

// Indicadores del panel (RF-13): cuenta los equipos por estado en la base, cuenta los préstamos
// Activos y Devueltos (D-09) y obtiene las áreas con más uso. Cuando el Colaborador consulta, el
// alcance llega como identificador y los préstamos se cuentan solo a su nombre.
public sealed class ConsultaDeIndicadores(ContextoDeTechAsset contexto, IReloj reloj)
    : IConsultaDeIndicadores
{
    public async Task<IndicadoresDelPanel> ObtenerAsync(
        Guid? idUsuarioResponsable,
        CancellationToken cancellationToken = default)
    {
        var conteos = await contexto.Equipos
            .AsNoTracking()
            .GroupBy(equipo => equipo.EstadoEquipo)
            .Select(grupo => new { Estado = grupo.Key, Total = grupo.Count() })
            .ToListAsync(cancellationToken);

        var conteoPorEstado = conteos
            .Select(conteo => new ConteoDeEstadoEquipo(conteo.Estado, conteo.Total))
            .ToList();

        var prestamos = contexto.Prestamos
            .AsNoTracking()
            .Where(prestamo =>
                prestamo.EstadoPrestamo == EstadoPrestamo.Activo
                || prestamo.EstadoPrestamo == EstadoPrestamo.Devuelto);

        if (idUsuarioResponsable is { } idUsuario)
        {
            prestamos = prestamos.Where(prestamo => prestamo.IdUsuario == idUsuario);
        }

        var totalPrestamos = await prestamos.CountAsync(cancellationToken);

        var porArea = await prestamos
            .GroupBy(prestamo => prestamo.Responsable.AreaUsuario)
            .Select(grupo => new { Area = grupo.Key, Total = grupo.Count() })
            .ToListAsync(cancellationToken);

        var areas = porArea
            .Select(conteo => new ConteoDePrestamosPorArea(conteo.Area, conteo.Total))
            .ToList();

        return IndicadoresDelPanel.Desde(
            conteoPorEstado,
            totalPrestamos,
            ReglasDeReportes.AreasConMayorUso(areas),
            reloj.AhoraEnUtc);
    }
}
