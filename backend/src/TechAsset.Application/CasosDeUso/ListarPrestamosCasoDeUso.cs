using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.CasosDeUso;

// RF-11: historial de préstamos con filtros. El Colaborador solo ve los suyos; el Responsable de
// Tecnología y el Administrador ven todos. El alcance se aplica en la API, no en la interfaz.
public sealed class ListarPrestamosCasoDeUso(IConsultaDePrestamos consultaDePrestamos)
{
    public Task<PaginaDePrestamos> EjecutarAsync(
        FiltroDePrestamos filtro,
        Guid idUsuarioSesion,
        RolUsuario rolSesion,
        CancellationToken cancellationToken = default) =>
        consultaDePrestamos.ListarAsync(
            AplicarAlcance(filtro, idUsuarioSesion, rolSesion),
            cancellationToken);

    // El Colaborador consulta lo suyo; los otros roles, todo el historial.
    internal static FiltroDePrestamos AplicarAlcance(
        FiltroDePrestamos filtro,
        Guid idUsuarioSesion,
        RolUsuario rolSesion) =>
        rolSesion == RolUsuario.Colaborador
            ? filtro with { IdUsuarioResponsable = idUsuarioSesion }
            : filtro;
}
