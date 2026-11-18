using TechAsset.Application.Comandos;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-09, RN-01, RN-02, RN-03 y D-05: el Responsable de Tecnología o el Administrador aprueban la
// solicitud. En la misma transacción se vuelve a comprobar el préstamo activo, el préstamo pasa a
// Activo con la fecha de hoy como fecha de préstamo, el equipo pasa a Prestado y queda el movimiento.
public sealed class AprobarPrestamoCasoDeUso(
    IRepositorioDePrestamos repositorioDePrestamos,
    IRepositorioDeEquipos repositorioDeEquipos,
    IRepositorioDeMovimientos repositorioDeMovimientos,
    IUnidadDeTrabajo unidadDeTrabajo,
    IReloj reloj)
{
    public Task<DetalleDePrestamo> EjecutarAsync(
        AprobarPrestamoComando comando,
        CancellationToken cancellationToken = default)
    {
        if (comando.RolSesion is not (RolUsuario.Administrador or RolUsuario.ResponsableDeTecnologia))
        {
            throw new AccesoDenegadoExcepcion(
                "Solo el Responsable de Tecnología y el Administrador pueden aprobar un préstamo.");
        }

        return unidadDeTrabajo.EjecutarEnTransaccionAsync(
            async token =>
            {
                await repositorioDePrestamos.BloquearParaActualizarAsync(comando.IdPrestamo, token);

                var prestamo = await repositorioDePrestamos.ObtenerPorIdAsync(comando.IdPrestamo, token)
                    ?? throw new RecursoNoEncontradoExcepcion("El préstamo no existe.");

                var equipo = await repositorioDeEquipos.ObtenerPorIdAsync(prestamo.IdEquipo, token)
                    ?? throw new RecursoNoEncontradoExcepcion("El equipo del préstamo no existe.");

                var tienePrestamoActivo = await repositorioDePrestamos.ExisteActivoPorEquipoAsync(
                    prestamo.IdEquipo,
                    token);

                if (tienePrestamoActivo)
                {
                    throw new ConflictoDeNegocioExcepcion(
                        "El equipo ya tiene un préstamo activo. Registre la devolución antes de aprobar otro.");
                }

                // RN-02 y RN-03: se comprueba antes de tocar el préstamo.
                equipo.ValidarPrestable();

                var hoy = reloj.HoyEnLima;

                prestamo.Aprobar(hoy);
                equipo.MarcarComoPrestado();

                await repositorioDeMovimientos.AgregarAsync(
                    Movimiento.DePrestamoAprobado(prestamo, comando.IdUsuarioSesion, reloj.AhoraEnUtc),
                    token);

                await repositorioDePrestamos.GuardarCambiosAsync(token);

                return DetalleDePrestamo.Desde(prestamo, hoy);
            },
            cancellationToken);
    }
}
