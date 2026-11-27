using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Pruebas.Dobles;

// Consulta de préstamos en memoria para probar casos de uso y endpoints sin PostgreSQL. Guarda los
// detalles sembrados y aplica los mismos filtros que la consulta real.
public sealed class ConsultaDePrestamosDePrueba : IConsultaDePrestamos
{
    private readonly List<DetalleDePrestamo> _prestamos = [];

    public FiltroDePrestamos? UltimoFiltro { get; private set; }

    public bool UltimaConsultaFueDeActivos { get; private set; }

    public void Sembrar(params DetalleDePrestamo[] prestamos) => _prestamos.AddRange(prestamos);

    public void Limpiar() => _prestamos.Clear();

    public Task<PaginaDePrestamos> ListarAsync(
        FiltroDePrestamos filtro,
        CancellationToken cancellationToken = default)
    {
        UltimoFiltro = filtro;
        UltimaConsultaFueDeActivos = false;
        return Task.FromResult(Paginar(filtro, soloActivos: false));
    }

    public Task<PaginaDePrestamos> ListarActivosAsync(
        FiltroDePrestamos filtro,
        CancellationToken cancellationToken = default)
    {
        UltimoFiltro = filtro;
        UltimaConsultaFueDeActivos = true;
        return Task.FromResult(Paginar(filtro, soloActivos: true));
    }

    public Task<DetalleDePrestamo?> ObtenerAsync(
        Guid idPrestamo,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(_prestamos.FirstOrDefault(prestamo => prestamo.IdPrestamo == idPrestamo));

    private PaginaDePrestamos Paginar(FiltroDePrestamos filtro, bool soloActivos)
    {
        var consulta = _prestamos.AsEnumerable();

        if (soloActivos)
        {
            consulta = consulta.Where(prestamo => prestamo.EstadoPrestamo == EstadoPrestamo.Activo);
        }

        if (filtro.Estado is { } estado)
        {
            consulta = consulta.Where(prestamo => prestamo.EstadoPrestamo == estado);
        }

        if (filtro.IdEquipo is { } idEquipo)
        {
            consulta = consulta.Where(prestamo => prestamo.IdEquipo == idEquipo);
        }

        if (filtro.IdUsuarioResponsable is { } idUsuario)
        {
            consulta = consulta.Where(prestamo => prestamo.IdUsuario == idUsuario);
        }

        if (filtro.Texto is { } texto)
        {
            consulta = consulta.Where(prestamo =>
                prestamo.CodigoPatrimonialEquipo.Contains(texto, StringComparison.OrdinalIgnoreCase)
                || prestamo.NombreEquipo.Contains(texto, StringComparison.OrdinalIgnoreCase)
                || prestamo.NombreResponsable.Contains(texto, StringComparison.OrdinalIgnoreCase));
        }

        if (filtro.Area is { } area)
        {
            consulta = consulta.Where(prestamo =>
                prestamo.AreaResponsable.Contains(area, StringComparison.OrdinalIgnoreCase));
        }

        if (filtro.Desde is { } desde)
        {
            consulta = consulta.Where(prestamo =>
                prestamo.FechaPrestamo is { } fecha && fecha >= desde);
        }

        if (filtro.Hasta is { } hasta)
        {
            consulta = consulta.Where(prestamo =>
                prestamo.FechaPrestamo is { } fecha && fecha <= hasta);
        }

        var lista = consulta.ToList();

        var datos = lista
            .OrderByDescending(prestamo => prestamo.FechaPrestamo)
            .Skip((filtro.Pagina - 1) * filtro.Tamano)
            .Take(filtro.Tamano)
            .Select(prestamo => new DatosDePrestamo(
                prestamo.IdPrestamo,
                prestamo.CodigoPatrimonialEquipo,
                prestamo.NombreEquipo,
                prestamo.NombreResponsable,
                prestamo.AreaResponsable,
                prestamo.FechaPrestamo,
                prestamo.FechaDevolucionPrestamo,
                prestamo.FechaDevolucionRealPrestamo,
                prestamo.EstadoPrestamo,
                prestamo.VencidoPrestamo))
            .ToList();

        return new PaginaDePrestamos(lista.Count, filtro.Pagina, filtro.Tamano, datos);
    }
}
