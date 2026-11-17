using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// Al abrir la SPA se comprueba la sesión contra la base: un usuario deshabilitado deja de tener acceso
// aunque su cookie siga vigente (RNF-17 y RNF-18).
public sealed class ObtenerSesionCasoDeUso(IRepositorioDeUsuarios repositorioDeUsuarios)
{
    public async Task<DatosDeSesion> EjecutarAsync(
        Guid idUsuario,
        CancellationToken cancellationToken = default)
    {
        var usuario = await repositorioDeUsuarios.ObtenerPorIdAsync(idUsuario, cancellationToken);

        if (usuario is null || !usuario.PuedeIngresar)
        {
            throw new NoAutenticadoExcepcion();
        }

        return DatosDeSesion.Desde(usuario);
    }
}
