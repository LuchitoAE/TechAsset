using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.CasosDeUso;

// RF-13 y D-10: el panel muestra los seis indicadores mínimos. El Responsable y el Administrador
// ven el conjunto de la empresa; el Colaborador ve los contadores del inventario y solo sus
// préstamos (el alcance se aplica aquí, no en la interfaz).
public sealed class ObtenerIndicadoresDelPanelCasoDeUso(IConsultaDeIndicadores consultaDeIndicadores)
{
    public Task<IndicadoresDelPanel> EjecutarAsync(
        Guid idUsuarioSesion,
        RolUsuario rolSesion,
        CancellationToken cancellationToken = default) =>
        consultaDeIndicadores.ObtenerAsync(
            rolSesion == RolUsuario.Colaborador ? idUsuarioSesion : null,
            cancellationToken);
}
