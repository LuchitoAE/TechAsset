using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Datos;

// Vista de un equipo para la API: la disponibilidad se deriva del estado y no se guarda aparte.
public sealed record DatosDeEquipo(
    Guid IdEquipo,
    string CodigoPatrimonialEquipo,
    string NombreEquipo,
    CategoriaEquipo CategoriaEquipo,
    string MarcaEquipo,
    EstadoEquipo EstadoEquipo,
    bool DisponibleEquipo)
{
    public static DatosDeEquipo Desde(Equipo equipo) => new(
        equipo.IdEquipo,
        equipo.CodigoPatrimonial.Valor,
        equipo.NombreEquipo,
        equipo.CategoriaEquipo,
        equipo.MarcaEquipo,
        equipo.EstadoEquipo,
        equipo.EstaDisponible);
}
