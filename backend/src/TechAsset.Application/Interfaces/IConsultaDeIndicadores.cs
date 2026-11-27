using TechAsset.Application.Datos;

namespace TechAsset.Application.Interfaces;

// Contrato de lectura de los indicadores del panel (RF-13). El Colaborador pasa su identificador
// para que «Total de préstamos» y «Área con mayor uso» se calculen solo con lo suyo.
public interface IConsultaDeIndicadores
{
    Task<IndicadoresDelPanel> ObtenerAsync(
        Guid? idUsuarioResponsable,
        CancellationToken cancellationToken = default);
}
