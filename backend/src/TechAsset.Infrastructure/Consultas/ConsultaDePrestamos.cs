using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Infrastructure.Persistencia;

namespace TechAsset.Infrastructure.Consultas;

// Consulta de lectura de RF-11 y RF-12: filtra en la base, pagina con ORDER BY estable, calcula el
// vencimiento con el reloj y proyecta solo los datos de la pantalla, sin cargar entidades.
public sealed class ConsultaDePrestamos(ContextoDeTechAsset contexto, IReloj reloj) : IConsultaDePrestamos
{
    public Task<PaginaDePrestamos> ListarAsync(
        FiltroDePrestamos filtro,
        CancellationToken cancellationToken = default) =>
        ListarInternoAsync(filtro, soloActivos: false, cancellationToken);

    public Task<PaginaDePrestamos> ListarActivosAsync(
        FiltroDePrestamos filtro,
        CancellationToken cancellationToken = default) =>
        ListarInternoAsync(filtro, soloActivos: true, cancellationToken);

    public Task<DetalleDePrestamo?> ObtenerAsync(
        Guid idPrestamo,
        CancellationToken cancellationToken = default)
    {
        var hoy = reloj.HoyEnLima;

        return contexto.Prestamos
            .AsNoTracking()
            .Where(prestamo => prestamo.IdPrestamo == idPrestamo)
            .Select(prestamo => new DetalleDePrestamo(
                prestamo.IdPrestamo,
                prestamo.IdEquipo,
                prestamo.Equipo.CodigoPatrimonial.Valor,
                prestamo.Equipo.NombreEquipo,
                prestamo.IdUsuario,
                prestamo.Responsable.NombresUsuario + " " + prestamo.Responsable.ApellidosUsuario,
                prestamo.Responsable.CorreoUsuario.Valor,
                prestamo.Responsable.AreaUsuario,
                prestamo.Periodo.FechaPrestamo,
                prestamo.Periodo.FechaDevolucionPrestamo,
                prestamo.FechaDevolucionRealPrestamo,
                prestamo.EstadoPrestamo,
                prestamo.EstadoPrestamo == EstadoPrestamo.Activo
                    && prestamo.Periodo.FechaDevolucionPrestamo < hoy,
                prestamo.ObservacionPrestamo,
                prestamo.MotivoRechazoPrestamo))
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<PaginaDePrestamos> ListarInternoAsync(
        FiltroDePrestamos filtro,
        bool soloActivos,
        CancellationToken cancellationToken)
    {
        var hoy = reloj.HoyEnLima;
        var consulta = contexto.Prestamos.AsNoTracking();

        if (filtro.Texto is { } texto)
        {
            var patron = $"%{texto}%";
            consulta = consulta.Where(prestamo =>
                EF.Functions.ILike(prestamo.Equipo.CodigoPatrimonial.Valor, patron)
                || EF.Functions.ILike(prestamo.Equipo.NombreEquipo, patron)
                || EF.Functions.ILike(prestamo.Responsable.NombresUsuario, patron)
                || EF.Functions.ILike(prestamo.Responsable.ApellidosUsuario, patron));
        }

        if (filtro.Estado is { } estado)
        {
            consulta = consulta.Where(prestamo => prestamo.EstadoPrestamo == estado);
        }

        if (filtro.IdEquipo is { } idEquipo)
        {
            consulta = consulta.Where(prestamo => prestamo.IdEquipo == idEquipo);
        }

        if (filtro.Area is { } area)
        {
            var patronArea = $"%{area}%";
            consulta = consulta.Where(prestamo =>
                EF.Functions.ILike(prestamo.Responsable.AreaUsuario, patronArea));
        }

        // El Colaborador solo ve sus préstamos: la API fija el responsable de la sesión.
        if (filtro.IdUsuarioResponsable is { } idUsuario)
        {
            consulta = consulta.Where(prestamo => prestamo.IdUsuario == idUsuario);
        }

        // El rango de fechas se aplica a la fecha de préstamo (la de la aprobación). Los préstamos
        // todavía pendientes no tienen fecha y quedan fuera del rango a propósito.
        if (filtro.Desde is { } desde)
        {
            consulta = consulta.Where(prestamo => prestamo.Periodo.FechaPrestamo >= desde);
        }

        if (filtro.Hasta is { } hasta)
        {
            consulta = consulta.Where(prestamo => prestamo.Periodo.FechaPrestamo <= hasta);
        }

        if (soloActivos)
        {
            consulta = consulta.Where(prestamo => prestamo.EstadoPrestamo == EstadoPrestamo.Activo);
        }

        var total = await consulta.CountAsync(cancellationToken);

        var prestamos = await consulta
            .OrderByDescending(prestamo => prestamo.Periodo.FechaPrestamo)
            .ThenByDescending(prestamo => prestamo.FechaSolicitudPrestamo)
            .Skip((filtro.Pagina - 1) * filtro.Tamano)
            .Take(filtro.Tamano)
            .Select(prestamo => new DatosDePrestamo(
                prestamo.IdPrestamo,
                prestamo.Equipo.CodigoPatrimonial.Valor,
                prestamo.Equipo.NombreEquipo,
                prestamo.Responsable.NombresUsuario + " " + prestamo.Responsable.ApellidosUsuario,
                prestamo.Responsable.AreaUsuario,
                prestamo.Periodo.FechaPrestamo,
                prestamo.Periodo.FechaDevolucionPrestamo,
                prestamo.FechaDevolucionRealPrestamo,
                prestamo.EstadoPrestamo,
                prestamo.EstadoPrestamo == EstadoPrestamo.Activo
                    && prestamo.Periodo.FechaDevolucionPrestamo < hoy))
            .ToListAsync(cancellationToken);

        return new PaginaDePrestamos(total, filtro.Pagina, filtro.Tamano, prestamos);
    }
}
