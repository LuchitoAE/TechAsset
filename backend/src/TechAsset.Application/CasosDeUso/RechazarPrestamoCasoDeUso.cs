using TechAsset.Application.Comandos;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-09: el Responsable de Tecnología o el Administrador rechazan una solicitud con su motivo; el
// equipo no cambia de estado, el préstamo queda Rechazado y el rechazo deja su movimiento (RF-17).
public sealed class RechazarPrestamoCasoDeUso(
    IRepositorioDePrestamos repositorioDePrestamos,
    IRepositorioDeMovimientos repositorioDeMovimientos,
    IUnidadDeTrabajo unidadDeTrabajo,
    IReloj reloj)
{
    public Task<DetalleDePrestamo> EjecutarAsync(
        RechazarPrestamoComando comando,
        CancellationToken cancellationToken = default)
    {
        if (comando.RolSesion is not (RolUsuario.Administrador or RolUsuario.ResponsableDeTecnologia))
        {
            throw new AccesoDenegadoExcepcion(
                "Solo el Responsable de Tecnología y el Administrador pueden rechazar un préstamo.");
        }

        return unidadDeTrabajo.EjecutarEnTransaccionAsync(
            async token =>
            {
                await repositorioDePrestamos.BloquearParaActualizarAsync(comando.IdPrestamo, token);

                var prestamo = await repositorioDePrestamos.ObtenerPorIdAsync(comando.IdPrestamo, token)
                    ?? throw new RecursoNoEncontradoExcepcion("El préstamo no existe.");

                prestamo.Rechazar(comando.MotivoRechazoPrestamo);

                await repositorioDeMovimientos.AgregarAsync(
                    Movimiento.DePrestamoRechazado(prestamo, comando.IdUsuarioSesion, reloj.AhoraEnUtc),
                    token);

                await repositorioDePrestamos.GuardarCambiosAsync(token);

                return DetalleDePrestamo.Desde(prestamo, reloj.HoyEnLima);
            },
            cancellationToken);
    }
}
