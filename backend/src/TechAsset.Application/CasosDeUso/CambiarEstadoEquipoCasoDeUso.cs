using TechAsset.Application.Comandos;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-08, D-05: solo el Administrador o el Responsable de Tecnología cambian el estado entre
// Disponible, Mantenimiento y Baja. Un equipo prestado primero debe volver con la devolución.
public sealed class CambiarEstadoEquipoCasoDeUso(IRepositorioDeEquipos repositorioDeEquipos)
{
    public async Task<DatosDeEquipo> EjecutarAsync(
        CambiarEstadoEquipoComando comando,
        CancellationToken cancellationToken = default)
    {
        if (comando.RolSesion is not (RolUsuario.Administrador or RolUsuario.ResponsableDeTecnologia))
        {
            throw new AccesoDenegadoExcepcion(
                "Solo el Administrador y el Responsable de Tecnología pueden cambiar el estado de un equipo.");
        }

        var equipo = await repositorioDeEquipos.ObtenerPorIdAsync(comando.IdEquipo, cancellationToken)
            ?? throw new RecursoNoEncontradoExcepcion("El equipo no existe.");

        equipo.CambiarEstado(comando.EstadoEquipo);
        await repositorioDeEquipos.GuardarCambiosAsync(cancellationToken);

        return DatosDeEquipo.Desde(equipo);
    }
}
