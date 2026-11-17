using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;

namespace TechAsset.Application.CasosDeUso;

// RF-03: listado de usuarios con filtros y paginación; el alcance por rol lo aplica la API.
public sealed class ListarUsuariosCasoDeUso(IConsultaDeUsuarios consultaDeUsuarios)
{
    public Task<PaginaDeUsuarios> EjecutarAsync(
        FiltroDeUsuarios filtro,
        CancellationToken cancellationToken = default) =>
        consultaDeUsuarios.ListarAsync(filtro, cancellationToken);
}
