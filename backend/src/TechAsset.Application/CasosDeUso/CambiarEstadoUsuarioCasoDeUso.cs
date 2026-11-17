using TechAsset.Application.Comandos;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-04, RN-09 y D-06: solo el Administrador deshabilita; no puede deshabilitarse a sí mismo ni dejar
// al sistema sin ningún Administrador activo. Deshabilitar conserva el historial del usuario.
public sealed class CambiarEstadoUsuarioCasoDeUso(IRepositorioDeUsuarios repositorioDeUsuarios)
{
    public async Task<DatosDeUsuario> EjecutarAsync(
        CambiarEstadoUsuarioComando comando,
        CancellationToken cancellationToken = default)
    {
        if (comando.RolSesion != RolUsuario.Administrador)
        {
            throw new AccesoDenegadoExcepcion("Solo el Administrador puede deshabilitar usuarios.");
        }

        var usuario = await repositorioDeUsuarios.ObtenerPorIdAsync(comando.IdUsuario, cancellationToken)
            ?? throw new RecursoNoEncontradoExcepcion("El usuario no existe.");

        if (!comando.ActivoUsuario)
        {
            if (usuario.IdUsuario == comando.IdUsuarioSesion)
            {
                throw new ConflictoDeNegocioExcepcion("No puede deshabilitar su propia cuenta.");
            }

            if (usuario.EsAdministradorActivo
                && await repositorioDeUsuarios.ContarAdministradoresActivosAsync(cancellationToken) <= 1)
            {
                throw new ConflictoDeNegocioExcepcion(
                    "No se puede deshabilitar al último Administrador activo.");
            }
        }

        usuario.CambiarEstado(comando.ActivoUsuario);
        await repositorioDeUsuarios.GuardarCambiosAsync(cancellationToken);

        return DatosDeUsuario.Desde(usuario);
    }
}
