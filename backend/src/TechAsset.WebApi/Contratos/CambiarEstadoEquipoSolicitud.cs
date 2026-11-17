using TechAsset.Domain.Enumeraciones;

namespace TechAsset.WebApi.Contratos;

/// <summary>Estado que se quiere dar al equipo en RF-08.</summary>
public sealed record CambiarEstadoEquipoSolicitud(EstadoEquipo? EstadoEquipo);
