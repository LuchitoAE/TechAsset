using TechAsset.Application.Comandos;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-01 y RN-08: registra un usuario activo con correo único y contraseña protegida.
public sealed class RegistrarUsuarioCasoDeUso(
    IRepositorioDeUsuarios repositorioDeUsuarios,
    IProtectorDeContrasenas protectorDeContrasenas)
{
    public async Task<DatosDeUsuario> EjecutarAsync(
        RegistrarUsuarioComando comando,
        CancellationToken cancellationToken = default)
    {
        var correoUsuario = CorreoElectronico.Crear(comando.CorreoUsuario);
        Contrasena.ExigirValida(comando.Contrasena);

        var correoDuplicado = await repositorioDeUsuarios.ExisteCorreoAsync(
            correoUsuario,
            exceptoIdUsuario: null,
            cancellationToken);

        if (correoDuplicado)
        {
            throw new ConflictoDeNegocioExcepcion("Ya existe un usuario con ese correo.");
        }

        var contrasenaProtegida = protectorDeContrasenas.Proteger(comando.Contrasena!);
        var usuario = Usuario.Registrar(
            comando.NombresUsuario,
            comando.ApellidosUsuario,
            correoUsuario,
            comando.AreaUsuario,
            comando.RolUsuario,
            contrasenaProtegida.SalContrasena,
            contrasenaProtegida.HashContrasena);

        await repositorioDeUsuarios.AgregarAsync(usuario, cancellationToken);
        await repositorioDeUsuarios.GuardarCambiosAsync(cancellationToken);

        return DatosDeUsuario.Desde(usuario);
    }
}
