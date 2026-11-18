using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Comandos;
using TechAsset.Application.Datos;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Domain.Excepciones;
using TechAsset.WebApi.Contratos;
using TechAsset.WebApi.Respuestas;
using TechAsset.WebApi.Seguridad;

namespace TechAsset.WebApi.Controladores;

// RF-09 a RF-12: préstamos y devoluciones. El Colaborador solicita y consulta lo suyo; el
// Responsable de Tecnología y el Administrador aprueban, rechazan, devuelven y ven todo el
// historial. La API comprueba el rol y el alcance en cada operación (D-04, RNF-18).
[ApiController]
[Route("api/prestamos")]
[Authorize]
public sealed class PrestamosControlador(
    SolicitarPrestamoCasoDeUso solicitarPrestamo,
    AprobarPrestamoCasoDeUso aprobarPrestamo,
    RechazarPrestamoCasoDeUso rechazarPrestamo,
    RegistrarDevolucionCasoDeUso registrarDevolucion,
    ListarPrestamosCasoDeUso listarPrestamos,
    ListarPrestamosActivosCasoDeUso listarPrestamosActivos,
    ObtenerPrestamoCasoDeUso obtenerPrestamo) : ControllerBase
{
    /// <summary>Historial de préstamos con filtros (RF-11). El Colaborador ve solo los suyos.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(RespuestaExitosa<PaginaDePrestamos>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<RespuestaExitosa<PaginaDePrestamos>>> Listar(
        [FromQuery] string? texto,
        [FromQuery] EstadoPrestamo? estado,
        [FromQuery] Guid? idEquipo,
        [FromQuery] string? area,
        [FromQuery] DateOnly? desde,
        [FromQuery] DateOnly? hasta,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamano = FiltroDePrestamos.TamanoPredeterminado,
        CancellationToken cancellationToken = default)
    {
        var filtro = FiltroDePrestamos.Normalizar(
            texto, estado, idEquipo, area, desde, hasta, pagina, tamano);

        var resultado = await listarPrestamos.EjecutarAsync(
            filtro,
            ClaimsDeUsuario.IdUsuario(User),
            ClaimsDeUsuario.Rol(User),
            cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(resultado, "Historial de préstamos consultado."));
    }

    /// <summary>Préstamos activos con los vencidos señalados (RF-12).</summary>
    [HttpGet("activos")]
    [Authorize(Roles = $"{PoliticasDeAcceso.Administrador},{PoliticasDeAcceso.ResponsableDeTecnologia}")]
    [ProducesResponseType(typeof(RespuestaExitosa<PaginaDePrestamos>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<RespuestaExitosa<PaginaDePrestamos>>> ListarActivos(
        [FromQuery] string? texto,
        [FromQuery] string? area,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamano = FiltroDePrestamos.TamanoPredeterminado,
        CancellationToken cancellationToken = default)
    {
        var filtro = FiltroDePrestamos.Normalizar(
            texto, EstadoPrestamo.Activo, idEquipo: null, area, desde: null, hasta: null, pagina, tamano);

        var resultado = await listarPrestamosActivos.EjecutarAsync(
            filtro,
            ClaimsDeUsuario.IdUsuario(User),
            ClaimsDeUsuario.Rol(User),
            cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(resultado, "Préstamos activos consultados."));
    }

    /// <summary>Detalle de un préstamo (RF-11); el Colaborador solo abre los suyos.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(RespuestaExitosa<DetalleDePrestamo>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RespuestaExitosa<DetalleDePrestamo>>> Obtener(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var prestamo = await obtenerPrestamo.EjecutarAsync(
            id,
            ClaimsDeUsuario.IdUsuario(User),
            ClaimsDeUsuario.Rol(User),
            cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(prestamo, "Préstamo consultado."));
    }

    /// <summary>Solicitud de préstamo del Colaborador (RF-09, RN-01 a RN-05).</summary>
    [HttpPost]
    [Authorize(Roles = PoliticasDeAcceso.Colaborador)]
    [ProducesResponseType(typeof(RespuestaExitosa<DetalleDePrestamo>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<RespuestaExitosa<DetalleDePrestamo>>> Solicitar(
        [FromBody] SolicitarPrestamoSolicitud solicitud,
        CancellationToken cancellationToken = default)
    {
        var prestamo = await solicitarPrestamo.EjecutarAsync(
            new SolicitarPrestamoComando(
                solicitud.IdEquipo,
                solicitud.FechaDevolucionPrestamo,
                ClaimsDeUsuario.IdUsuario(User),
                ClaimsDeUsuario.Rol(User)),
            cancellationToken);

        return CreatedAtAction(
            nameof(Obtener),
            new { id = prestamo.IdPrestamo },
            RespuestasDeLaApi.Exitosa(prestamo, "Préstamo solicitado."));
    }

    /// <summary>Aprobar o rechazar una solicitud (RF-09, D-04).</summary>
    [HttpPatch("{id:guid}/aprobacion")]
    [Authorize(Roles = $"{PoliticasDeAcceso.Administrador},{PoliticasDeAcceso.ResponsableDeTecnologia}")]
    [ProducesResponseType(typeof(RespuestaExitosa<DetalleDePrestamo>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<RespuestaExitosa<DetalleDePrestamo>>> Decidir(
        Guid id,
        [FromBody] AprobacionPrestamoSolicitud solicitud,
        CancellationToken cancellationToken = default)
    {
        if (solicitud.AprobadoPrestamo is not { } aprobado)
        {
            throw new DatosInvalidosExcepcion(
                CamposDePrestamo.EstadoPrestamo,
                "Indique si el préstamo se aprueba o se rechaza.");
        }

        if (aprobado)
        {
            var aprobadoPrestamo = await aprobarPrestamo.EjecutarAsync(
                new AprobarPrestamoComando(id, ClaimsDeUsuario.Rol(User)),
                cancellationToken);

            return Ok(RespuestasDeLaApi.Exitosa(aprobadoPrestamo, "Préstamo aprobado."));
        }

        var rechazado = await rechazarPrestamo.EjecutarAsync(
            new RechazarPrestamoComando(id, solicitud.MotivoRechazoPrestamo, ClaimsDeUsuario.Rol(User)),
            cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(rechazado, "Préstamo rechazado."));
    }

    /// <summary>Devolución de un préstamo activo con observaciones (RF-10, RN-10).</summary>
    [HttpPatch("{id:guid}/devolucion")]
    [Authorize(Roles = $"{PoliticasDeAcceso.Administrador},{PoliticasDeAcceso.ResponsableDeTecnologia}")]
    [ProducesResponseType(typeof(RespuestaExitosa<DetalleDePrestamo>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<RespuestaExitosa<DetalleDePrestamo>>> RegistrarDevolucion(
        Guid id,
        [FromBody] DevolucionPrestamoSolicitud solicitud,
        CancellationToken cancellationToken = default)
    {
        var devolucion = await registrarDevolucion.EjecutarAsync(
            new RegistrarDevolucionComando(
                id,
                solicitud.ObservacionPrestamo,
                ClaimsDeUsuario.Rol(User)),
            cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(devolucion, "Devolución registrada."));
    }
}
