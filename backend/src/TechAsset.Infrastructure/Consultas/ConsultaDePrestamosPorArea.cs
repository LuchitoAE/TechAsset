using Microsoft.EntityFrameworkCore;
using TechAsset.Application;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Infrastructure.Persistencia;

namespace TechAsset.Infrastructure.Consultas;

// Préstamos por área del responsable (RF-16). Cuenta Activos y Devueltos (D-09) en el periodo,
// agrega las áreas del catálogo de usuarios para que las que no tienen préstamos aparezcan en cero y
// deja el orden y los porcentajes a la regla pura.
public sealed class ConsultaDePrestamosPorArea(ContextoDeTechAsset contexto)
    : IConsultaDePrestamosPorArea
{
    public async Task<ReporteDePrestamosPorArea> ObtenerAsync(
        FiltroDePrestamosPorArea filtro,
        CancellationToken cancellationToken = default)
    {
        var consulta = contexto.Prestamos
            .AsNoTracking()
            .Where(prestamo =>
                prestamo.EstadoPrestamo == EstadoPrestamo.Activo
                || prestamo.EstadoPrestamo == EstadoPrestamo.Devuelto);

        if (filtro.Desde is { } desde)
        {
            consulta = consulta.Where(prestamo => prestamo.Periodo.FechaPrestamo >= desde);
        }

        if (filtro.Hasta is { } hasta)
        {
            consulta = consulta.Where(prestamo => prestamo.Periodo.FechaPrestamo <= hasta);
        }

        var porArea = await consulta
            .GroupBy(prestamo => prestamo.Responsable.AreaUsuario)
            .Select(grupo => new { Area = grupo.Key, Total = grupo.Count() })
            .ToListAsync(cancellationToken);

        var areasConocidas = await contexto.Usuarios
            .AsNoTracking()
            .Select(usuario => usuario.AreaUsuario)
            .Distinct()
            .ToListAsync(cancellationToken);

        return ReglasDeReportes.CompletarAreas(
            areasConocidas,
            porArea.Select(conteo => new ConteoDePrestamosPorArea(conteo.Area, conteo.Total)));
    }
}
