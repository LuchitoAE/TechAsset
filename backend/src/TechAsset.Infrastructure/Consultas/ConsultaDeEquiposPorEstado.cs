using Microsoft.EntityFrameworkCore;
using TechAsset.Application;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Infrastructure.Persistencia;

namespace TechAsset.Infrastructure.Consultas;

// Reporte de equipos por estado (RF-14): filtra en la base por texto, categoría y marca, proyecta
// solo los datos de la pantalla y agrupa con la regla pura que garantiza los cuatro estados y que la
// suma coincida con el total.
public sealed class ConsultaDeEquiposPorEstado(ContextoDeTechAsset contexto)
    : IConsultaDeEquiposPorEstado
{
    public async Task<ReporteDeEquiposPorEstado> ObtenerAsync(
        FiltroDeEquiposPorEstado filtro,
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

        var equipos = await consulta
            .OrderBy(equipo => equipo.CodigoPatrimonial.Valor)
            .Select(equipo => new DatosDeEquipo(
                equipo.IdEquipo,
                equipo.CodigoPatrimonial.Valor,
                equipo.NombreEquipo,
                equipo.CategoriaEquipo,
                equipo.MarcaEquipo,
                equipo.EstadoEquipo,
                equipo.EstadoEquipo == EstadoEquipo.Disponible))
            .ToListAsync(cancellationToken);

        return ReglasDeReportes.AgruparPorEstado(equipos);
    }
}
