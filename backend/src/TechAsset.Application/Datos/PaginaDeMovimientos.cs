using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Datos;

// Fila del historial de movimientos (RF-17): tipo, fecha, equipo, usuario y detalle.
public sealed record DatosDeMovimiento(
    Guid IdMovimiento,
    TipoMovimiento TipoMovimiento,
    DateTimeOffset FechaMovimiento,
    Guid IdEquipo,
    string CodigoPatrimonialEquipo,
    string NombreEquipo,
    Guid IdUsuario,
    string NombreUsuario,
    string DetalleMovimiento);

// Página del historial de movimientos: total filtrado y los movimientos de la página.
public sealed record PaginaDeMovimientos(
    int Total,
    int Pagina,
    int Tamano,
    IReadOnlyList<DatosDeMovimiento> Movimientos);
