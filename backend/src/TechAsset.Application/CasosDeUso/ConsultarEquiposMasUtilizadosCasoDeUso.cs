using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;

namespace TechAsset.Application.CasosDeUso;

// RF-15: ranking de equipos por cantidad de préstamos contados (Activos y Devueltos, D-09).
public sealed class ConsultarEquiposMasUtilizadosCasoDeUso(
    IConsultaDeEquiposMasUtilizados consultaDeEquiposMasUtilizados)
{
    public Task<IReadOnlyList<DatosDeEquipoMasUtilizado>> EjecutarAsync(
        FiltroDeEquiposMasUtilizados filtro,
        CancellationToken cancellationToken = default) =>
        consultaDeEquiposMasUtilizados.ObtenerAsync(filtro, cancellationToken);
}
