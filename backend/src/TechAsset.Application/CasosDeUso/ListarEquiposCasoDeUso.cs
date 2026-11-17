using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;

namespace TechAsset.Application.CasosDeUso;

// RF-07: listado del inventario con filtros, conteo por estado y paginación. El alcance por rol
// (el Colaborador ve el inventario completo en solo lectura) lo aplica la API.
public sealed class ListarEquiposCasoDeUso(IConsultaDeEquipos consultaDeEquipos)
{
    public Task<PaginaDeEquipos> EjecutarAsync(
        FiltroDeEquipos filtro,
        CancellationToken cancellationToken = default) =>
        consultaDeEquipos.ListarAsync(filtro, cancellationToken);
}
