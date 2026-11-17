using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-03: detalle de un usuario para la pantalla de edición.
public sealed class ObtenerUsuarioCasoDeUso(IConsultaDeUsuarios consultaDeUsuarios)
{
    public async Task<DatosDeUsuario> EjecutarAsync(
        Guid idUsuario,
        CancellationToken cancellationToken = default)
    {
        return await consultaDeUsuarios.ObtenerAsync(idUsuario, cancellationToken)
            ?? throw new RecursoNoEncontradoExcepcion("El usuario no existe.");
    }
}
