using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Infrastructure.Persistencia;

namespace TechAsset.Infrastructure.Consultas;

// Consulta de lectura de RF-07: filtra en la base, cuenta por estado, pagina con ORDER BY estable y
// proyecta solo los datos de la pantalla. No carga entidades (patrón de consultas separadas).
public sealed class ConsultaDeEquipos(ContextoDeTechAsset contexto) : IConsultaDeEquipos
{
    public async Task<PaginaDeEquipos> ListarAsync(
        FiltroDeEquipos filtro,
        CancellationToken cancellationToken = default)
    {
        var consulta = contexto.Equipos.AsNoTracking();

        if (filtro.Texto is { } texto)
        {
            var patron = $"%{texto}%";
            consulta = consulta.Where(equipo =>
                EF.Functions.ILike(equipo.CodigoPatrimonial.Valor, patron)
                || EF.Functions.ILike(equipo.NombreEquipo, patron)
                || EF.Functions.ILike(equipo.MarcaEquipo, patron));
        }

        if (filtro.Categoria is { } categoria)
        {
            consulta = consulta.Where(equipo => equipo.CategoriaEquipo == categoria);
        }

        if (filtro.Marca is { } marca)
        {
            var patronMarca = $"%{marca}%";
            consulta = consulta.Where(equipo => EF.Functions.ILike(equipo.MarcaEquipo, patronMarca));
        }

        // El conteo de los chips ignora el filtro de estado: así el usuario ve cuántos equipos hay
        // en cada estado con el resto de filtros aplicados.
        var conteos = await consulta
            .GroupBy(equipo => equipo.EstadoEquipo)
            .Select(grupo => new { Estado = grupo.Key, Total = grupo.Count() })
            .ToListAsync(cancellationToken);

        var conteoPorEstado = conteos
            .OrderBy(conteo => (int)conteo.Estado)
            .Select(conteo => new ConteoDeEstadoEquipo(conteo.Estado, conteo.Total))
            .ToList();

        if (filtro.Estado is { } estado)
        {
            consulta = consulta.Where(equipo => equipo.EstadoEquipo == estado);
        }

        var total = await consulta.CountAsync(cancellationToken);

        var equipos = await consulta
            .OrderBy(equipo => equipo.CodigoPatrimonial.Valor)
            .ThenBy(equipo => equipo.NombreEquipo)
            .Skip((filtro.Pagina - 1) * filtro.Tamano)
            .Take(filtro.Tamano)
            .Select(equipo => new DatosDeEquipo(
                equipo.IdEquipo,
                equipo.CodigoPatrimonial.Valor,
                equipo.NombreEquipo,
                equipo.CategoriaEquipo,
                equipo.MarcaEquipo,
                equipo.EstadoEquipo,
                equipo.EstadoEquipo == EstadoEquipo.Disponible))
            .ToListAsync(cancellationToken);

        return new PaginaDeEquipos(total, filtro.Pagina, filtro.Tamano, conteoPorEstado, equipos);
    }

    public Task<DatosDeEquipo?> ObtenerAsync(
        Guid idEquipo,
        CancellationToken cancellationToken = default) =>
        contexto.Equipos
            .AsNoTracking()
            .Where(equipo => equipo.IdEquipo == idEquipo)
            .Select(equipo => new DatosDeEquipo(
                equipo.IdEquipo,
                equipo.CodigoPatrimonial.Valor,
                equipo.NombreEquipo,
                equipo.CategoriaEquipo,
                equipo.MarcaEquipo,
                equipo.EstadoEquipo,
                equipo.EstadoEquipo == EstadoEquipo.Disponible))
            .FirstOrDefaultAsync(cancellationToken);
}
