using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Datos;
using TechAsset.Domain.Enumeraciones;
using TechAsset.WebApi.Respuestas;
using TechAsset.WebApi.Seguridad;

namespace TechAsset.WebApi.Controladores;

// RF-13 a RF-17: salidas del sistema. El panel lo consulta cualquier sesión (con el alcance del
// Colaborador); los cuatro reportes son del Responsable de Tecnología y del Administrador. Todas
// las consultas se leen de la base en cada petición.
[ApiController]
[Route("api/reportes")]
[Authorize]
public sealed class ReportesControlador(
    ObtenerIndicadoresDelPanelCasoDeUso obtenerIndicadores,
    ConsultarEquiposPorEstadoCasoDeUso consultarEquiposPorEstado,
    ConsultarEquiposMasUtilizadosCasoDeUso consultarEquiposMasUtilizados,
    ConsultarPrestamosPorAreaCasoDeUso consultarPrestamosPorArea,
    ConsultarMovimientosCasoDeUso consultarMovimientos) : ControllerBase
{
    /// <summary>Los seis indicadores mínimos del panel (RF-13, D-10).</summary>
    [HttpGet("panel")]
    [ProducesResponseType(typeof(RespuestaExitosa<IndicadoresDelPanel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<RespuestaExitosa<IndicadoresDelPanel>>> Panel(
        CancellationToken cancellationToken = default)
    {
        var indicadores = await obtenerIndicadores.EjecutarAsync(
            ClaimsDeUsuario.IdUsuario(User),
            ClaimsDeUsuario.Rol(User),
            cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(indicadores, "Indicadores del panel consultados."));
    }

    /// <summary>Equipos por estado con filtros de categoría, marca y texto (RF-14).</summary>
    [HttpGet("equipos-por-estado")]
    [Authorize(Roles = $"{PoliticasDeAcceso.Administrador},{PoliticasDeAcceso.ResponsableDeTecnologia}")]
    [ProducesResponseType(typeof(RespuestaExitosa<ReporteDeEquiposPorEstado>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<RespuestaExitosa<ReporteDeEquiposPorEstado>>> EquiposPorEstado(
        [FromQuery] string? texto,
        [FromQuery] CategoriaEquipo? categoria,
        [FromQuery] string? marca,
        CancellationToken cancellationToken = default)
    {
        var filtro = FiltroDeEquiposPorEstado.Normalizar(texto, categoria, marca);
        var reporte = await consultarEquiposPorEstado.EjecutarAsync(filtro, cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(reporte, "Equipos por estado consultados."));
    }

    /// <summary>Ranking de equipos más utilizados (RF-15).</summary>
    [HttpGet("equipos-mas-utilizados")]
    [Authorize(Roles = $"{PoliticasDeAcceso.Administrador},{PoliticasDeAcceso.ResponsableDeTecnologia}")]
    [ProducesResponseType(
        typeof(RespuestaExitosa<IReadOnlyList<DatosDeEquipoMasUtilizado>>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<RespuestaExitosa<IReadOnlyList<DatosDeEquipoMasUtilizado>>>> EquiposMasUtilizados(
        [FromQuery] int limite = FiltroDeEquiposMasUtilizados.LimitePredeterminado,
        CancellationToken cancellationToken = default)
    {
        var filtro = FiltroDeEquiposMasUtilizados.Normalizar(limite);
        var ranking = await consultarEquiposMasUtilizados.EjecutarAsync(filtro, cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(ranking, "Equipos más utilizados consultados."));
    }

    /// <summary>Préstamos por área del responsable en un periodo (RF-16).</summary>
    [HttpGet("prestamos-por-area")]
    [Authorize(Roles = $"{PoliticasDeAcceso.Administrador},{PoliticasDeAcceso.ResponsableDeTecnologia}")]
    [ProducesResponseType(typeof(RespuestaExitosa<ReporteDePrestamosPorArea>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<RespuestaExitosa<ReporteDePrestamosPorArea>>> PrestamosPorArea(
        [FromQuery] DateOnly? desde,
        [FromQuery] DateOnly? hasta,
        CancellationToken cancellationToken = default)
    {
        var filtro = FiltroDePrestamosPorArea.Normalizar(desde, hasta);
        var reporte = await consultarPrestamosPorArea.EjecutarAsync(filtro, cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(reporte, "Préstamos por área consultados."));
    }

    /// <summary>Historial de movimientos con filtros y paginación (RF-17).</summary>
    [HttpGet("movimientos")]
    // Se publica también como /api/movimientos para que el recurso se pueda consultar por su nombre.
    [HttpGet("/api/movimientos")]
    [Authorize(Roles = $"{PoliticasDeAcceso.Administrador},{PoliticasDeAcceso.ResponsableDeTecnologia}")]
    [ProducesResponseType(typeof(RespuestaExitosa<PaginaDeMovimientos>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<RespuestaExitosa<PaginaDeMovimientos>>> Movimientos(
        [FromQuery] TipoMovimiento? tipo,
        [FromQuery] string? equipo,
        [FromQuery] string? usuario,
        [FromQuery] string? texto,
        [FromQuery] DateOnly? desde,
        [FromQuery] DateOnly? hasta,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamano = FiltroDeMovimientos.TamanoPredeterminado,
        CancellationToken cancellationToken = default)
    {
        var filtro = FiltroDeMovimientos.Normalizar(
            tipo, equipo, usuario, texto, desde, hasta, pagina, tamano);

        var movimientos = await consultarMovimientos.EjecutarAsync(filtro, cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(movimientos, "Movimientos consultados."));
    }
}
