using TechAsset.Application.Datos;

namespace TechAsset.Application.Interfaces;

// Contrato de lectura de usuarios: proyecta los datos que necesita la pantalla sin cargar entidades.
public interface IConsultaDeUsuarios
{
    Task<PaginaDeUsuarios> ListarAsync(
        FiltroDeUsuarios filtro,
        CancellationToken cancellationToken = default);

    Task<DatosDeUsuario?> ObtenerAsync(Guid idUsuario, CancellationToken cancellationToken = default);
}
