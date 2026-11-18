using TechAsset.Application.Comandos;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-10, RN-10 y D-05: el Responsable de Tecnología o el Administrador registran la devolución con
// observaciones obligatorias. En la misma transacción el préstamo pasa a Devuelto con la fecha real
// y el equipo vuelve a Disponible.
public sealed class RegistrarDevolucionCasoDeUso(
    IRepositorioDePrestamos repositorioDePrestamos,
    IRepositorioDeEquipos repositorioDeEquipos,
    IUnidadDeTrabajo unidadDeTrabajo,
    IReloj reloj)
{
    public Task<DetalleDePrestamo> EjecutarAsync(
        RegistrarDevolucionComando comando,
        CancellationToken cancellationToken = default)
    {
        if (comando.RolSesion is not (RolUsuario.Administrador or RolUsuario.ResponsableDeTecnologia))
        {
            throw new AccesoDenegadoExcepcion(
                "Solo el Responsable de Tecnología y el Administrador pueden registrar una devolución.");
        }

        return unidadDeTrabajo.EjecutarEnTransaccionAsync(
            async token =>
            {
                await repositorioDePrestamos.BloquearParaActualizarAsync(comando.IdPrestamo, token);

                var prestamo = await repositorioDePrestamos.ObtenerPorIdAsync(comando.IdPrestamo, token)
                    ?? throw new RecursoNoEncontradoExcepcion("El préstamo no existe.");

                var equipo = await repositorioDeEquipos.ObtenerPorIdAsync(prestamo.IdEquipo, token)
                    ?? throw new RecursoNoEncontradoExcepcion("El equipo del préstamo no existe.");

                var hoy = reloj.HoyEnLima;

                prestamo.RegistrarDevolucion(comando.ObservacionPrestamo, hoy);
                equipo.MarcarComoDisponible();

                await repositorioDePrestamos.GuardarCambiosAsync(token);

                return DetalleDePrestamo.Desde(prestamo, hoy);
            },
            cancellationToken);
    }
}
