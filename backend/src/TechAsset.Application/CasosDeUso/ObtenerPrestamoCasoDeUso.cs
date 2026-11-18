using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-11: detalle de un préstamo. El Colaborador solo puede abrir los suyos; los otros roles, todos.
public sealed class ObtenerPrestamoCasoDeUso(IConsultaDePrestamos consultaDePrestamos)
{
    public async Task<DetalleDePrestamo> EjecutarAsync(
        Guid idPrestamo,
        Guid idUsuarioSesion,
        RolUsuario rolSesion,
        CancellationToken cancellationToken = default)
    {
        var prestamo = await consultaDePrestamos.ObtenerAsync(idPrestamo, cancellationToken)
            ?? throw new RecursoNoEncontradoExcepcion("El préstamo no existe.");

        if (rolSesion == RolUsuario.Colaborador && prestamo.IdUsuario != idUsuarioSesion)
        {
            throw new AccesoDenegadoExcepcion("Solo puede consultar sus propios préstamos.");
        }

        return prestamo;
    }
}
