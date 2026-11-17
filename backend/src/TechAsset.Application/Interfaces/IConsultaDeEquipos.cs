using TechAsset.Application.Datos;

namespace TechAsset.Application.Interfaces;

// Contrato de lectura del inventario: filtra, cuenta por estado y proyecta sin cargar entidades.
public interface IConsultaDeEquipos
{
    Task<PaginaDeEquipos> ListarAsync(
        FiltroDeEquipos filtro,
        CancellationToken cancellationToken = default);

    Task<DatosDeEquipo?> ObtenerAsync(Guid idEquipo, CancellationToken cancellationToken = default);
}
