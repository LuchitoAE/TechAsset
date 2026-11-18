using TechAsset.Application.Comandos;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Application.CasosDeUso;

// RF-09, RN-01 a RN-05 y D-04: el Colaborador solicita un equipo disponible para una fecha
// posterior a hoy; el préstamo queda Solicitado a su nombre hasta que el Responsable lo apruebe.
public sealed class SolicitarPrestamoCasoDeUso(
    IRepositorioDeEquipos repositorioDeEquipos,
    IRepositorioDeUsuarios repositorioDeUsuarios,
    IRepositorioDePrestamos repositorioDePrestamos,
    IReloj reloj)
{
    public async Task<DetalleDePrestamo> EjecutarAsync(
        SolicitarPrestamoComando comando,
        CancellationToken cancellationToken = default)
    {
        if (comando.RolSesion != RolUsuario.Colaborador)
        {
            throw new AccesoDenegadoExcepcion(
                "Solo un colaborador puede solicitar un préstamo; el Responsable de Tecnología lo aprueba.");
        }

        if (comando.IdEquipo is not { } idEquipo)
        {
            throw new DatosInvalidosExcepcion(
                CamposDePrestamo.IdEquipo,
                "Seleccione el equipo que desea solicitar.");
        }

        var equipo = await repositorioDeEquipos.ObtenerPorIdAsync(idEquipo, cancellationToken)
            ?? throw new RecursoNoEncontradoExcepcion("El equipo no existe.");

        // RN-01: el equipo que ya tiene un préstamo activo no admite otra solicitud. Se comprueba
        // antes que el estado para explicar la causa real.
        var tienePrestamoActivo = await repositorioDePrestamos.ExisteActivoPorEquipoAsync(
            idEquipo,
            cancellationToken);

        if (tienePrestamoActivo)
        {
            throw new ConflictoDeNegocioExcepcion(
                "El equipo ya tiene un préstamo activo. Elija otro equipo disponible.");
        }

        // RN-02 y RN-03: se avisa antes de registrar la solicitud.
        equipo.ValidarPrestable();

        // RN-05: el responsable es el colaborador de la sesión.
        var responsable = await repositorioDeUsuarios.ObtenerPorIdAsync(
            comando.IdUsuarioSesion,
            cancellationToken)
            ?? throw new RecursoNoEncontradoExcepcion("El colaborador que solicita no existe.");

        var hoy = reloj.HoyEnLima;

        var prestamo = Prestamo.Solicitar(
            equipo,
            responsable,
            comando.FechaDevolucionPrestamo,
            hoy,
            reloj.AhoraEnUtc);

        await repositorioDePrestamos.AgregarAsync(prestamo, cancellationToken);
        await repositorioDePrestamos.GuardarCambiosAsync(cancellationToken);

        return DetalleDePrestamo.Desde(prestamo, hoy);
    }
}
