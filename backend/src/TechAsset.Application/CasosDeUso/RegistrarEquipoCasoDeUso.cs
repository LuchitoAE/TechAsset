using TechAsset.Application.Comandos;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-05 y RN-07: registra un equipo con código patrimonial único y estado inicial válido.
public sealed class RegistrarEquipoCasoDeUso(IRepositorioDeEquipos repositorioDeEquipos)
{
    public async Task<DatosDeEquipo> EjecutarAsync(
        RegistrarEquipoComando comando,
        CancellationToken cancellationToken = default)
    {
        var codigoPatrimonial = CodigoPatrimonial.Crear(comando.CodigoPatrimonialEquipo);

        var codigoDuplicado = await repositorioDeEquipos.ExisteCodigoAsync(
            codigoPatrimonial,
            exceptoIdEquipo: null,
            cancellationToken);

        if (codigoDuplicado)
        {
            throw new ConflictoDeNegocioExcepcion("Ya existe un equipo con ese código patrimonial.");
        }

        var equipo = Equipo.Registrar(
            codigoPatrimonial,
            comando.NombreEquipo,
            comando.CategoriaEquipo,
            comando.MarcaEquipo,
            comando.EstadoEquipo ?? EstadoEquipo.Disponible);

        await repositorioDeEquipos.AgregarAsync(equipo, cancellationToken);
        await repositorioDeEquipos.GuardarCambiosAsync(cancellationToken);

        return DatosDeEquipo.Desde(equipo);
    }
}
