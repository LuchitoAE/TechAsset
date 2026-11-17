using TechAsset.Application.Comandos;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-02: actualiza los datos del usuario, mantiene el correo único (RN-08) y protege al último
// Administrador activo (D-06). La contraseña solo cambia si se envía una nueva.
public sealed class ActualizarUsuarioCasoDeUso(
    IRepositorioDeUsuarios repositorioDeUsuarios,
    IProtectorDeContrasenas protectorDeContrasenas)
{
    public async Task<DatosDeUsuario> EjecutarAsync(
        ActualizarUsuarioComando comando,
        CancellationToken cancellationToken = default)
    {
        var usuario = await repositorioDeUsuarios.ObtenerPorIdAsync(comando.IdUsuario, cancellationToken)
            ?? throw new RecursoNoEncontradoExcepcion("El usuario no existe.");

        var correoUsuario = CorreoElectronico.Crear(comando.CorreoUsuario);

        var correoDuplicado = await repositorioDeUsuarios.ExisteCorreoAsync(
            correoUsuario,
            comando.IdUsuario,
            cancellationToken);

        if (correoDuplicado)
        {
            throw new ConflictoDeNegocioExcepcion("Ya existe un usuario con ese correo.");
        }

        ContrasenaProtegida? contrasenaProtegida = null;
        if (!string.IsNullOrWhiteSpace(comando.ContrasenaNueva))
        {
            Contrasena.ExigirValida(comando.ContrasenaNueva);
            contrasenaProtegida = protectorDeContrasenas.Proteger(comando.ContrasenaNueva);
        }

        var dejaDeSerAdministrador = usuario.EsAdministradorActivo
            && comando.RolUsuario != TechAsset.Domain.Enumeraciones.RolUsuario.Administrador;

        if (dejaDeSerAdministrador
            && await repositorioDeUsuarios.ContarAdministradoresActivosAsync(cancellationToken) <= 1)
        {
            throw new ConflictoDeNegocioExcepcion(
                "No se puede quitar el rol de Administrador al último Administrador activo.");
        }

        usuario.Actualizar(
            comando.NombresUsuario,
            comando.ApellidosUsuario,
            correoUsuario,
            comando.AreaUsuario,
            comando.RolUsuario,
            contrasenaProtegida?.SalContrasena,
            contrasenaProtegida?.HashContrasena);

        await repositorioDeUsuarios.GuardarCambiosAsync(cancellationToken);

        return DatosDeUsuario.Desde(usuario);
    }
}
