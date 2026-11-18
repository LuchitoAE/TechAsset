using TechAsset.Application.Comandos;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-06 y RN-07: corrige los datos del equipo y mantiene el código único. El estado no se cambia
// aquí y el código no se mueve mientras el equipo tenga un préstamo activo: eso se comprueba contra
// los préstamos y no solo contra estado_equipo (iteración 4).
public sealed class ActualizarEquipoCasoDeUso(
    IRepositorioDeEquipos repositorioDeEquipos,
    IRepositorioDePrestamos repositorioDePrestamos)
{
    public async Task<DatosDeEquipo> EjecutarAsync(
        ActualizarEquipoComando comando,
        CancellationToken cancellationToken = default)
    {
        var equipo = await repositorioDeEquipos.ObtenerPorIdAsync(comando.IdEquipo, cancellationToken)
            ?? throw new RecursoNoEncontradoExcepcion("El equipo no existe.");

        var codigoPatrimonial = CodigoPatrimonial.Crear(comando.CodigoPatrimonialEquipo);

        var codigoDuplicado = await repositorioDeEquipos.ExisteCodigoAsync(
            codigoPatrimonial,
            comando.IdEquipo,
            cancellationToken);

        if (codigoDuplicado)
        {
            throw new ConflictoDeNegocioExcepcion("Ya existe un equipo con ese código patrimonial.");
        }

        var tienePrestamoActivo = await repositorioDePrestamos.ExisteActivoPorEquipoAsync(
            comando.IdEquipo,
            cancellationToken);

        equipo.Actualizar(
            codigoPatrimonial,
            comando.NombreEquipo,
            comando.CategoriaEquipo,
            comando.MarcaEquipo,
            tienePrestamoActivo);

        await repositorioDeEquipos.GuardarCambiosAsync(cancellationToken);

        return DatosDeEquipo.Desde(equipo);
    }
}
