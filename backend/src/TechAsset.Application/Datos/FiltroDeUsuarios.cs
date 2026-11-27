using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Datos;

// Filtros de RF-03: texto (nombre o correo), rol, estado y área, con paginación.
public sealed record FiltroDeUsuarios(
    string? Texto,
    RolUsuario? Rol,
    bool? Activo,
    string? Area,
    int Pagina,
    int Tamano)
{
    public const int TamanoPredeterminado = 20;
    public const int TamanoMaximo = 100;

    public static FiltroDeUsuarios Normalizar(
        string? texto,
        RolUsuario? rol,
        bool? activo,
        string? area,
        int pagina,
        int tamano) => new(
            string.IsNullOrWhiteSpace(texto) ? null : texto.Trim(),
            rol,
            activo,
            string.IsNullOrWhiteSpace(area) ? null : area.Trim(),
            pagina < 1 ? 1 : pagina,
            tamano is < 1 or > TamanoMaximo ? TamanoPredeterminado : tamano);
}
