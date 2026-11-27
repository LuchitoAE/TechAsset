using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Comandos;

// Datos de entrada de RF-06. El estado no viaja: se cambia con RF-08.
public sealed record ActualizarEquipoComando(
    Guid IdEquipo,
    string? CodigoPatrimonialEquipo,
    string? NombreEquipo,
    CategoriaEquipo CategoriaEquipo,
    string? MarcaEquipo,
    Guid IdUsuarioSesion);
