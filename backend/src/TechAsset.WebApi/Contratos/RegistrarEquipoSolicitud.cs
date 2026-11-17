using TechAsset.Domain.Enumeraciones;

namespace TechAsset.WebApi.Contratos;

/// <summary>Datos para registrar un equipo (RF-05). Si no se indica estado, nace Disponible.</summary>
public sealed record RegistrarEquipoSolicitud(
    string? CodigoPatrimonialEquipo,
    string? NombreEquipo,
    CategoriaEquipo? CategoriaEquipo,
    string? MarcaEquipo,
    EstadoEquipo? EstadoEquipo);
