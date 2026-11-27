using TechAsset.Application.Comandos;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-08, D-05: solo el Administrador o el Responsable de Tecnología cambian el estado entre
// Disponible, Mantenimiento y Baja. Un equipo con préstamo activo primero debe volver con la
// devolución; se comprueba el préstamo real y no solo el estado_equipo. El cambio deja su
// movimiento con el estado anterior y el nuevo (RF-17).
public sealed class CambiarEstadoEquipoCasoDeUso(
    IRepositorioDeEquipos repositorioDeEquipos,
    IRepositorioDePrestamos repositorioDePrestamos,
    IRepositorioDeMovimientos repositorioDeMovimientos,
    IReloj reloj)
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

        var tienePrestamoActivo = await repositorioDePrestamos.ExisteActivoPorEquipoAsync(
            comando.IdEquipo,
            cancellationToken);

        var estadoAnterior = equipo.EstadoEquipo;

        equipo.CambiarEstado(comando.EstadoEquipo, tienePrestamoActivo);

        await repositorioDeMovimientos.AgregarAsync(
            Movimiento.DeCambioDeEstado(
                equipo,
                estadoAnterior,
                comando.IdUsuarioSesion,
                reloj.AhoraEnUtc),
            cancellationToken);

        await repositorioDeEquipos.GuardarCambiosAsync(cancellationToken);

        return DatosDeEquipo.Desde(equipo);
    }
}
