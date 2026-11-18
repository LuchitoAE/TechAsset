using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Datos;

// Filtros de RF-17: tipo de movimiento, texto del equipo, texto del usuario, rango de fechas y una
// búsqueda libre sobre el detalle, con paginación. Se ordena del más reciente al más antiguo.
public sealed record FiltroDeMovimientos(
    TipoMovimiento? TipoMovimiento,
    string? Equipo,
    string? Usuario,
    string? Texto,
    DateOnly? Desde,
    DateOnly? Hasta,
    int Pagina,
    int Tamano)
{
    public const int TamanoPredeterminado = 20;
    public const int TamanoMaximo = 100;

    public static FiltroDeMovimientos Normalizar(
        TipoMovimiento? tipoMovimiento,
        string? equipo,
        string? usuario,
        string? texto,
        DateOnly? desde,
        DateOnly? hasta,
        int pagina,
        int tamano) => new(
            tipoMovimiento,
            string.IsNullOrWhiteSpace(equipo) ? null : equipo.Trim(),
            string.IsNullOrWhiteSpace(usuario) ? null : usuario.Trim(),
            string.IsNullOrWhiteSpace(texto) ? null : texto.Trim(),
            desde,
            hasta,
            pagina < 1 ? 1 : pagina,
            tamano is < 1 or > TamanoMaximo ? TamanoPredeterminado : tamano);
}
