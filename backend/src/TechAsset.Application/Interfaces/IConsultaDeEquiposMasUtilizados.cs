using TechAsset.Application.Datos;

namespace TechAsset.Application.Interfaces;

// Contrato de lectura del ranking de equipos más utilizados (RF-15).
public interface IConsultaDeEquiposMasUtilizados
{
    Task<IReadOnlyList<DatosDeEquipoMasUtilizado>> ObtenerAsync(
        FiltroDeEquiposMasUtilizados filtro,
        CancellationToken cancellationToken = default);
}
