using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Comandos;

// Datos de entrada de RF-05. Si no se indica estado, el equipo nace Disponible.
public sealed record RegistrarEquipoComando(
    string? CodigoPatrimonialEquipo,
    string? NombreEquipo,
    CategoriaEquipo CategoriaEquipo,
    string? MarcaEquipo,
    EstadoEquipo? EstadoEquipo);
