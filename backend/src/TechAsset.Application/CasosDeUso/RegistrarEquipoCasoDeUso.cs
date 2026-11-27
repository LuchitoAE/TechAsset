using TechAsset.Application.Comandos;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-05 y RN-07: registra un equipo con código patrimonial único y estado inicial válido. El alta
// deja su movimiento en la misma confirmación (RF-17, D-03).
public sealed class RegistrarEquipoCasoDeUso(
    IRepositorioDeEquipos repositorioDeEquipos,
    IRepositorioDeMovimientos repositorioDeMovimientos,
    IReloj reloj)
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

        await repositorioDeMovimientos.AgregarAsync(
            Movimiento.DeEquipoRegistrado(equipo, comando.IdUsuarioSesion, reloj.AhoraEnUtc),
            cancellationToken);

        await repositorioDeEquipos.GuardarCambiosAsync(cancellationToken);

        return DatosDeEquipo.Desde(equipo);
    }
}
