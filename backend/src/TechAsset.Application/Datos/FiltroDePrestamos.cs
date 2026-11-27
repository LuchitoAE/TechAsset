using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Datos;

// Filtros de RF-11 y RF-12: estado, equipo, área del responsable, rango de fechas de préstamo y
// texto (código o nombre del equipo, nombre del responsable), con paginación.
public sealed record FiltroDePrestamos(
    string? Texto,
    EstadoPrestamo? Estado,
    Guid? IdEquipo,
    string? Area,
    DateOnly? Desde,
    DateOnly? Hasta,
    int Pagina,
    int Tamano,
    Guid? IdUsuarioResponsable)
{
    public const int TamanoPredeterminado = 20;
    public const int TamanoMaximo = 100;

    public static FiltroDePrestamos Normalizar(
        string? texto,
        EstadoPrestamo? estado,
        Guid? idEquipo,
        string? area,
        DateOnly? desde,
        DateOnly? hasta,
        int pagina,
        int tamano) => new(
            string.IsNullOrWhiteSpace(texto) ? null : texto.Trim(),
            estado,
            idEquipo,
            string.IsNullOrWhiteSpace(area) ? null : area.Trim(),
            desde,
            hasta,
            pagina < 1 ? 1 : pagina,
            tamano is < 1 or > TamanoMaximo ? TamanoPredeterminado : tamano,
            IdUsuarioResponsable: null);
}
