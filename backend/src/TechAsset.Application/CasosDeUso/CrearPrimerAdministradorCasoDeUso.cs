using TechAsset.Application.Comandos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.CasosDeUso;

// Crea el primer Administrador al arrancar la API. Es idempotente: si ya existe un Administrador activo,
// no hace nada. Los datos vienen de la configuración segura (user-secrets), nunca del repositorio.
public sealed class CrearPrimerAdministradorCasoDeUso(
    IRepositorioDeUsuarios repositorioDeUsuarios,
    IProtectorDeContrasenas protectorDeContrasenas)
{
    public async Task<bool> EjecutarAsync(
        CrearPrimerAdministradorComando comando,
        CancellationToken cancellationToken = default)
    {
        if (await repositorioDeUsuarios.ContarAdministradoresActivosAsync(cancellationToken) > 0)
        {
            return false;
        }

        var correoUsuario = CorreoElectronico.Crear(comando.CorreoUsuario);

        if (await repositorioDeUsuarios.ExisteCorreoAsync(correoUsuario, null, cancellationToken))
        {
            return false;
        }

        Contrasena.ExigirValida(comando.Contrasena);

        var contrasenaProtegida = protectorDeContrasenas.Proteger(comando.Contrasena!);
        var usuario = Usuario.Registrar(
            comando.NombresUsuario,
            comando.ApellidosUsuario,
            correoUsuario,
            comando.AreaUsuario,
            RolUsuario.Administrador,
            contrasenaProtegida.SalContrasena,
            contrasenaProtegida.HashContrasena);

        await repositorioDeUsuarios.AgregarAsync(usuario, cancellationToken);
        await repositorioDeUsuarios.GuardarCambiosAsync(cancellationToken);

        return true;
    }
}
