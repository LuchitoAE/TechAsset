using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Application.CasosDeUso;

// RF-12: préstamos activos con la fecha de devolución comprometida y los vencidos resaltados. Solo
// el Responsable de Tecnología y el Administrador acceden; el Colaborador ve los suyos en RF-11.
public sealed class ListarPrestamosActivosCasoDeUso(IConsultaDePrestamos consultaDePrestamos)
{
    public Task<PaginaDePrestamos> EjecutarAsync(
        FiltroDePrestamos filtro,
        Guid idUsuarioSesion,
        RolUsuario rolSesion,
        CancellationToken cancellationToken = default) =>
        consultaDePrestamos.ListarActivosAsync(
            ListarPrestamosCasoDeUso.AplicarAlcance(filtro, idUsuarioSesion, rolSesion),
            cancellationToken);
}
