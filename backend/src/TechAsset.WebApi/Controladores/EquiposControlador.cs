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

// RF-05 a RF-08: equipos e inventario. Los tres roles consultan; solo el Administrador y el
// Responsable de Tecnología registran, actualizan y cambian el estado (RNF-18).
[ApiController]
[Route("api/equipos")]
[Authorize]
public sealed class EquiposControlador(
    RegistrarEquipoCasoDeUso registrarEquipo,
    ActualizarEquipoCasoDeUso actualizarEquipo,
    ListarEquiposCasoDeUso listarEquipos,
    ObtenerEquipoCasoDeUso obtenerEquipo,
    CambiarEstadoEquipoCasoDeUso cambiarEstadoEquipo) : ControllerBase
{
    /// <summary>Inventario con filtros por estado, categoría, marca y texto (RF-07).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(RespuestaExitosa<PaginaDeEquipos>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<RespuestaExitosa<PaginaDeEquipos>>> Listar(
        [FromQuery] string? texto,
        [FromQuery] EstadoEquipo? estado,
        [FromQuery] CategoriaEquipo? categoria,
        [FromQuery] string? marca,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamano = FiltroDeEquipos.TamanoPredeterminado,
        CancellationToken cancellationToken = default)
    {
        var filtro = FiltroDeEquipos.Normalizar(texto, estado, categoria, marca, pagina, tamano);
        var resultado = await listarEquipos.EjecutarAsync(filtro, cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(resultado, "Inventario consultado."));
    }

    /// <summary>Detalle de un equipo (RF-07).</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(RespuestaExitosa<DatosDeEquipo>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RespuestaExitosa<DatosDeEquipo>>> Obtener(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var equipo = await obtenerEquipo.EjecutarAsync(id, cancellationToken);
        return Ok(RespuestasDeLaApi.Exitosa(equipo, "Equipo consultado."));
    }

    /// <summary>Registra un equipo con código patrimonial único (RF-05, RN-07).</summary>
    [HttpPost]
    [Authorize(Roles = $"{PoliticasDeAcceso.Administrador},{PoliticasDeAcceso.ResponsableDeTecnologia}")]
    [ProducesResponseType(typeof(RespuestaExitosa<DatosDeEquipo>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<RespuestaExitosa<DatosDeEquipo>>> Registrar(
        [FromBody] RegistrarEquipoSolicitud solicitud,
        CancellationToken cancellationToken = default)
    {
        var categoria = solicitud.CategoriaEquipo ?? throw new DatosInvalidosExcepcion(
            CamposDeEquipo.CategoriaEquipo,
            "La categoría es obligatoria.");

        var equipo = await registrarEquipo.EjecutarAsync(
            new RegistrarEquipoComando(
                solicitud.CodigoPatrimonialEquipo,
                solicitud.NombreEquipo,
                categoria,
                solicitud.MarcaEquipo,
                solicitud.EstadoEquipo),
            cancellationToken);

        return CreatedAtAction(
            nameof(Obtener),
            new { id = equipo.IdEquipo },
            RespuestasDeLaApi.Exitosa(equipo, "Equipo registrado."));
    }

    /// <summary>Actualiza los datos del equipo; el código sigue siendo único (RF-06, RN-07).</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{PoliticasDeAcceso.Administrador},{PoliticasDeAcceso.ResponsableDeTecnologia}")]
    [ProducesResponseType(typeof(RespuestaExitosa<DatosDeEquipo>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<RespuestaExitosa<DatosDeEquipo>>> Actualizar(
        Guid id,
        [FromBody] ActualizarEquipoSolicitud solicitud,
        CancellationToken cancellationToken = default)
    {
        var categoria = solicitud.CategoriaEquipo ?? throw new DatosInvalidosExcepcion(
            CamposDeEquipo.CategoriaEquipo,
            "La categoría es obligatoria.");

        var equipo = await actualizarEquipo.EjecutarAsync(
            new ActualizarEquipoComando(
                id,
                solicitud.CodigoPatrimonialEquipo,
                solicitud.NombreEquipo,
                categoria,
                solicitud.MarcaEquipo),
            cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(equipo, "Equipo actualizado."));
    }

    /// <summary>Cambia el estado entre Disponible, Mantenimiento y Baja (RF-08, D-05).</summary>
    [HttpPatch("{id:guid}/estado")]
    [Authorize(Roles = $"{PoliticasDeAcceso.Administrador},{PoliticasDeAcceso.ResponsableDeTecnologia}")]
    [ProducesResponseType(typeof(RespuestaExitosa<DatosDeEquipo>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<RespuestaExitosa<DatosDeEquipo>>> CambiarEstado(
        Guid id,
        [FromBody] CambiarEstadoEquipoSolicitud solicitud,
        CancellationToken cancellationToken = default)
    {
        if (solicitud.EstadoEquipo is not { } estado)
        {
            throw new DatosInvalidosExcepcion(
                CamposDeEquipo.EstadoEquipo,
                "Indique el estado del equipo.");
        }

        var equipo = await cambiarEstadoEquipo.EjecutarAsync(
            new CambiarEstadoEquipoComando(
                id,
                estado,
                ClaimsDeUsuario.Rol(User)),
            cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(equipo, "Estado del equipo actualizado."));
    }
}
