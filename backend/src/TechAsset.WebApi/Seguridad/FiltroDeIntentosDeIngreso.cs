using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using TechAsset.Domain.Excepciones;
using TechAsset.WebApi.Contratos;
using TechAsset.WebApi.Respuestas;

namespace TechAsset.WebApi.Seguridad;

// Corta el ingreso cuando la combinación correo/IP acumuló cinco fallos en un minuto y cuenta los
// 401 que devuelve el caso de uso. Vive en un filtro para que el controlador siga sin try/catch y
// para que la respuesta 429 salga con el mismo ProblemDetails que el resto de la API.
public sealed class FiltroDeIntentosDeIngreso(LimiteDeIntentosDeIngreso limite) : IAsyncActionFilter
{
    public const string MensajeDeBloqueo =
        "Demasiados intentos de ingreso. Espere un minuto y vuelva a intentarlo.";

    public async Task OnActionExecutionAsync(
        ActionExecutingContext contexto,
        ActionExecutionDelegate siguiente)
    {
        var solicitud = contexto.ActionArguments.Values.OfType<IniciarSesionSolicitud>().FirstOrDefault();
        var correoUsuario = solicitud?.CorreoUsuario;
        var direccionOrigen = contexto.HttpContext.Connection.RemoteIpAddress?.ToString();

        if (limite.EstaBloqueado(correoUsuario, direccionOrigen))
        {
            contexto.HttpContext.Response.Headers.RetryAfter =
                LimiteDeIntentosDeIngreso.SegundosDeBloqueo.ToString();

            contexto.Result = new ObjectResult(RespuestasDeError.Crear(
                contexto.HttpContext,
                StatusCodes.Status429TooManyRequests,
                "Demasiados intentos",
                MensajeDeBloqueo))
            {
                StatusCode = StatusCodes.Status429TooManyRequests,
                ContentTypes = { "application/problem+json" }
            };

            return;
        }

        var ejecutado = await siguiente();

        if (ejecutado.Exception is CredencialesInvalidasExcepcion)
        {
            limite.RegistrarFallo(correoUsuario, direccionOrigen);
        }
        else if (ejecutado.Result is OkObjectResult)
        {
            limite.RegistrarExito(correoUsuario, direccionOrigen);
        }
    }
}
