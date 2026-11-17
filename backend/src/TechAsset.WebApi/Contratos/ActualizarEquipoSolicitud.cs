using TechAsset.Domain.Enumeraciones;

namespace TechAsset.WebApi.Contratos;

/// <summary>Datos para actualizar un equipo (RF-06). El estado se cambia con RF-08.</summary>
public sealed record ActualizarEquipoSolicitud(
    string? CodigoPatrimonialEquipo,
    string? NombreEquipo,
    CategoriaEquipo? CategoriaEquipo,
    string? MarcaEquipo);
