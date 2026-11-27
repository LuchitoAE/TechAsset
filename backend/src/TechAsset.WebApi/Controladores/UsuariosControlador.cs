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

// RF-01 a RF-04: usuarios. La API comprueba el rol en cada operación (RN-09, RNF-18); la interfaz
// solo oculta lo que el rol no puede hacer.
[ApiController]
[Route("api/usuarios")]
[Authorize]
public sealed class UsuariosControlador(
    RegistrarUsuarioCasoDeUso registrarUsuario,
    ActualizarUsuarioCasoDeUso actualizarUsuario,
    ListarUsuariosCasoDeUso listarUsuarios,
    ObtenerUsuarioCasoDeUso obtenerUsuario,
    CambiarEstadoUsuarioCasoDeUso cambiarEstadoUsuario) : ControllerBase
{
    /// <summary>Listado con filtros por texto, rol, estado y área (RF-03).</summary>
    [HttpGet]
    [Authorize(Roles = $"{PoliticasDeAcceso.Administrador},{PoliticasDeAcceso.ResponsableDeTecnologia}")]
    [ProducesResponseType(typeof(RespuestaExitosa<PaginaDeUsuarios>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<RespuestaExitosa<PaginaDeUsuarios>>> Listar(
        [FromQuery] string? texto,
        [FromQuery] RolUsuario? rol,
        [FromQuery] bool? activo,
        [FromQuery] string? area,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamano = FiltroDeUsuarios.TamanoPredeterminado,
        CancellationToken cancellationToken = default)
    {
        var filtro = FiltroDeUsuarios.Normalizar(texto, rol, activo, area, pagina, tamano);
        var resultado = await listarUsuarios.EjecutarAsync(filtro, cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(resultado, "Usuarios consultados."));
    }

    /// <summary>Detalle de un usuario (RF-03).</summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = $"{PoliticasDeAcceso.Administrador},{PoliticasDeAcceso.ResponsableDeTecnologia}")]
    [ProducesResponseType(typeof(RespuestaExitosa<DatosDeUsuario>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RespuestaExitosa<DatosDeUsuario>>> Obtener(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var usuario = await obtenerUsuario.EjecutarAsync(id, cancellationToken);
        return Ok(RespuestasDeLaApi.Exitosa(usuario, "Usuario consultado."));
    }

    /// <summary>Registra un usuario con correo único y contraseña inicial (RF-01, RN-08).</summary>
    [HttpPost]
    [Authorize(Roles = PoliticasDeAcceso.Administrador)]
    [ProducesResponseType(typeof(RespuestaExitosa<DatosDeUsuario>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<RespuestaExitosa<DatosDeUsuario>>> Registrar(
        [FromBody] RegistrarUsuarioSolicitud solicitud,
        CancellationToken cancellationToken = default)
    {
        var rol = solicitud.RolUsuario ?? throw new DatosInvalidosExcepcion(
            CamposDeUsuario.RolUsuario,
            "El rol es obligatorio.");

        var usuario = await registrarUsuario.EjecutarAsync(
            new RegistrarUsuarioComando(
                solicitud.NombresUsuario,
                solicitud.ApellidosUsuario,
                solicitud.CorreoUsuario,
                solicitud.AreaUsuario,
                rol,
                solicitud.Contrasena),
            cancellationToken);

        return CreatedAtAction(
            nameof(Obtener),
            new { id = usuario.IdUsuario },
            RespuestasDeLaApi.Exitosa(usuario, "Usuario registrado."));
    }

    /// <summary>Actualiza los datos y, si llega, la contraseña de un usuario (RF-02).</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = PoliticasDeAcceso.Administrador)]
    [ProducesResponseType(typeof(RespuestaExitosa<DatosDeUsuario>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<RespuestaExitosa<DatosDeUsuario>>> Actualizar(
        Guid id,
        [FromBody] ActualizarUsuarioSolicitud solicitud,
        CancellationToken cancellationToken = default)
    {
        var rol = solicitud.RolUsuario ?? throw new DatosInvalidosExcepcion(
            CamposDeUsuario.RolUsuario,
            "El rol es obligatorio.");

        var usuario = await actualizarUsuario.EjecutarAsync(
            new ActualizarUsuarioComando(
                id,
                solicitud.NombresUsuario,
                solicitud.ApellidosUsuario,
                solicitud.CorreoUsuario,
                solicitud.AreaUsuario,
                rol,
                solicitud.ContrasenaNueva),
            cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(usuario, "Usuario actualizado."));
    }

    /// <summary>Habilita o deshabilita un usuario; solo el Administrador (RF-04, RN-09).</summary>
    [HttpPatch("{id:guid}/estado")]
    [Authorize(Roles = PoliticasDeAcceso.Administrador)]
    [ProducesResponseType(typeof(RespuestaExitosa<DatosDeUsuario>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<RespuestaExitosa<DatosDeUsuario>>> CambiarEstado(
        Guid id,
        [FromBody] CambiarEstadoUsuarioSolicitud solicitud,
        CancellationToken cancellationToken = default)
    {
        if (solicitud.ActivoUsuario is not { } activo)
        {
            throw new DatosInvalidosExcepcion(
                CamposDeUsuario.ActivoUsuario,
                "Indique si el usuario queda activo.");
        }

        var usuario = await cambiarEstadoUsuario.EjecutarAsync(
            new CambiarEstadoUsuarioComando(
                id,
                activo,
                ClaimsDeUsuario.IdUsuario(User),
                ClaimsDeUsuario.Rol(User)),
            cancellationToken);

        var mensaje = activo ? "Usuario habilitado." : "Usuario deshabilitado.";
        return Ok(RespuestasDeLaApi.Exitosa(usuario, mensaje));
    }
}
