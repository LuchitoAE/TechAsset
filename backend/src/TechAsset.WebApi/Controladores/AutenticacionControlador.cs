using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Comandos;
using TechAsset.Application.Datos;
using TechAsset.WebApi.Contratos;
using TechAsset.WebApi.Respuestas;
using TechAsset.WebApi.Seguridad;

namespace TechAsset.WebApi.Controladores;

// RN-11 y RNF-17: ingreso con correo y contraseña, consulta de la sesión y salida. La cookie la emite
// el manejador de cookies de ASP.NET Core y el JavaScript de la página no puede leerla.
[ApiController]
[Route("api/autenticacion")]
public sealed class AutenticacionControlador(
    IniciarSesionCasoDeUso iniciarSesion,
    ObtenerSesionCasoDeUso obtenerSesion,
    CerrarSesionCasoDeUso cerrarSesion) : ControllerBase
{
    /// <summary>Ingresa con correo y contraseña (RN-11), con límite de intentos fallidos.</summary>
    [HttpPost("ingreso")]
    [AllowAnonymous]
    [ServiceFilter(typeof(FiltroDeIntentosDeIngreso))]
    [ProducesResponseType(typeof(RespuestaExitosa<DatosDeSesion>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<RespuestaExitosa<DatosDeSesion>>> Ingresar(
        [FromBody] IniciarSesionSolicitud solicitud,
        CancellationToken cancellationToken = default)
    {
        var sesion = await iniciarSesion.EjecutarAsync(
            new IniciarSesionComando(solicitud.CorreoUsuario, solicitud.Contrasena),
            cancellationToken);

        var identidad = ClaimsDeUsuario.Crear(sesion);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new System.Security.Claims.ClaimsPrincipal(identidad),
            new AuthenticationProperties
            {
                IsPersistent = false,
                ExpiresUtc = DateTimeOffset.UtcNow.AddHours(8)
            });

        return Ok(RespuestasDeLaApi.Exitosa(sesion, "Bienvenido a TechAsset."));
    }

    /// <summary>Devuelve la sesión actual; la SPA lo llama al abrir (RNF-17).</summary>
    [HttpGet("sesion")]
    [Authorize]
    [ProducesResponseType(typeof(RespuestaExitosa<DatosDeSesion>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<RespuestaExitosa<DatosDeSesion>>> Sesion(
        CancellationToken cancellationToken = default)
    {
        var sesion = await obtenerSesion.EjecutarAsync(
            ClaimsDeUsuario.IdUsuario(User),
            cancellationToken);

        return Ok(RespuestasDeLaApi.Exitosa(sesion, "Sesión vigente."));
    }

    /// <summary>Cierra la sesión y elimina la cookie (RN-11).</summary>
    [HttpPost("salida")]
    [Authorize]
    [ProducesResponseType(typeof(RespuestaExitosa<object>), StatusCodes.Status200OK)]
    public async Task<ActionResult<RespuestaExitosa<object>>> Salir()
    {
        var mensaje = cerrarSesion.Ejecutar();
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        return Ok(RespuestasDeLaApi.Exitosa<object>(new { sesion = "cerrada" }, mensaje));
    }
}
