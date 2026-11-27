using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-07: detalle de un equipo para la pantalla de edición y para la consulta del inventario.
public sealed class ObtenerEquipoCasoDeUso(IConsultaDeEquipos consultaDeEquipos)
{
    public async Task<DatosDeEquipo> EjecutarAsync(
        Guid idEquipo,
        CancellationToken cancellationToken = default)
    {
        return await consultaDeEquipos.ObtenerAsync(idEquipo, cancellationToken)
            ?? throw new RecursoNoEncontradoExcepcion("El equipo no existe.");
    }
}
