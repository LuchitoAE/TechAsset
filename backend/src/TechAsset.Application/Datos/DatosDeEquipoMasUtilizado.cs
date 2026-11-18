using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.Datos;

// Fila del ranking de equipos más utilizados (RF-15): cuántos préstamos contados tiene el equipo y
// el área o las áreas que más lo usaron (D-09: si hay empate se muestran todas).
public sealed record DatosDeEquipoMasUtilizado(
    Guid IdEquipo,
    string CodigoPatrimonialEquipo,
    string NombreEquipo,
    CategoriaEquipo CategoriaEquipo,
    int TotalPrestamos,
    IReadOnlyList<string> AreasConMayorUso);
