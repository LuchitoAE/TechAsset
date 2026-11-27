using Microsoft.EntityFrameworkCore;
using TechAsset.Application;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Infrastructure.Persistencia;

namespace TechAsset.Infrastructure.Consultas;

// Historial de movimientos (RF-17): filtra por tipo, equipo, usuario, texto y rango de fechas, cuenta
// el total y pagina del más reciente al más antiguo con un orden estable. Proyecta solo lo que
// muestra la pantalla y no carga entidades.
public sealed class ConsultaDeMovimientos(ContextoDeTechAsset contexto) : IConsultaDeMovimientos
{
    public async Task<PaginaDeMovimientos> ListarAsync(
        FiltroDeMovimientos filtro,
        CancellationToken cancellationToken = default)
    {
        var consulta = contexto.Movimientos.AsNoTracking();

        if (filtro.TipoMovimiento is { } tipoMovimiento)
        {
            consulta = consulta.Where(movimiento => movimiento.TipoMovimiento == tipoMovimiento);
        }

        if (filtro.Equipo is { } equipo)
        {
            var patronEquipo = $"%{equipo}%";
            consulta = consulta.Where(movimiento =>
                EF.Functions.ILike(movimiento.Equipo.CodigoPatrimonial.Valor, patronEquipo)
                || EF.Functions.ILike(movimiento.Equipo.NombreEquipo, patronEquipo));
        }

        if (filtro.Usuario is { } usuario)
        {
            var patronUsuario = $"%{usuario}%";
            consulta = consulta.Where(movimiento =>
                EF.Functions.ILike(movimiento.Usuario.NombresUsuario, patronUsuario)
                || EF.Functions.ILike(movimiento.Usuario.ApellidosUsuario, patronUsuario));
        }

        if (filtro.Texto is { } texto)
        {
            var patron = $"%{texto}%";
            consulta = consulta.Where(movimiento =>
                EF.Functions.ILike(movimiento.DetalleMovimiento, patron)
                || EF.Functions.ILike(movimiento.Equipo.CodigoPatrimonial.Valor, patron)
                || EF.Functions.ILike(movimiento.Equipo.NombreEquipo, patron)
                || EF.Functions.ILike(movimiento.Usuario.NombresUsuario, patron)
                || EF.Functions.ILike(movimiento.Usuario.ApellidosUsuario, patron));
        }

        var (desde, hastaExclusivo) = RangoDeFechas.DelDia(filtro.Desde, filtro.Hasta);

        if (desde is { } inicio)
        {
            consulta = consulta.Where(movimiento => movimiento.FechaMovimiento >= inicio);
        }

        if (hastaExclusivo is { } fin)
        {
            consulta = consulta.Where(movimiento => movimiento.FechaMovimiento < fin);
        }

        var total = await consulta.CountAsync(cancellationToken);

        var movimientos = await consulta
            .OrderByDescending(movimiento => movimiento.FechaMovimiento)
            .ThenByDescending(movimiento => movimiento.IdMovimiento)
            .Skip((filtro.Pagina - 1) * filtro.Tamano)
            .Take(filtro.Tamano)
            .Select(movimiento => new DatosDeMovimiento(
                movimiento.IdMovimiento,
                movimiento.TipoMovimiento,
                movimiento.FechaMovimiento,
                movimiento.IdEquipo,
                movimiento.Equipo.CodigoPatrimonial.Valor,
                movimiento.Equipo.NombreEquipo,
                movimiento.IdUsuario,
                movimiento.Usuario.NombresUsuario + " " + movimiento.Usuario.ApellidosUsuario,
                movimiento.DetalleMovimiento))
            .ToListAsync(cancellationToken);

        return new PaginaDeMovimientos(total, filtro.Pagina, filtro.Tamano, movimientos);
    }
}
