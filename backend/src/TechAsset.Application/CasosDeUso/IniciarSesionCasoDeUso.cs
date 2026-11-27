using TechAsset.Application.Comandos;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RN-11: valida el correo y la contraseña y devuelve los datos de la sesión. Un usuario deshabilitado
// no ingresa. El mismo mensaje cubre correo inexistente, contraseña incorrecta y cuenta inactiva.
public sealed class IniciarSesionCasoDeUso(
    IRepositorioDeUsuarios repositorioDeUsuarios,
    IProtectorDeContrasenas protectorDeContrasenas)
{
    public async Task<DatosDeSesion> EjecutarAsync(
        IniciarSesionComando comando,
        CancellationToken cancellationToken = default)
    {
        var correoUsuario = CorreoElectronico.Crear(comando.CorreoUsuario);
        var usuario = await repositorioDeUsuarios.ObtenerPorCorreoAsync(correoUsuario, cancellationToken);

        if (usuario is null || !usuario.PuedeIngresar)
        {
            throw new CredencialesInvalidasExcepcion();
        }

        var contrasenaCorrecta = protectorDeContrasenas.Verificar(
            comando.Contrasena ?? string.Empty,
            usuario.SalContrasenaUsuario,
            usuario.HashContrasenaUsuario);

        if (!contrasenaCorrecta)
        {
            throw new CredencialesInvalidasExcepcion();
        }

        return DatosDeSesion.Desde(usuario);
    }
}
