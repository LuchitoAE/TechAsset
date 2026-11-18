using Microsoft.AspNetCore.Mvc;

namespace TechAsset.WebApi.Respuestas;

// Escribe un error con el formato RFC 9457 que usa toda la API: success:false, message y status.
public static class RespuestasDeError
{
    // Un solo lugar arma el ProblemDetails para que el manejador de errores y los filtros que
    // responden antes del controlador (por ejemplo, el límite de intentos) no diverjan.
    public static ProblemDetails Crear(
        HttpContext contexto,
        int estado,
        string titulo,
        string mensaje,
        IReadOnlyDictionary<string, string[]>? errores = null)
    {
        var problema = new ProblemDetails
        {
            Status = estado,
            Title = titulo,
            Detail = mensaje,
            Instance = contexto.Request.Path
        };

        problema.Extensions["success"] = false;
        problema.Extensions["message"] = mensaje;

        if (errores is not null)
        {
            problema.Extensions["errors"] = errores;
        }

        return problema;
    }

    public static async Task EscribirAsync(
        HttpContext contexto,
        int estado,
        string titulo,
        string mensaje,
        IReadOnlyDictionary<string, string[]>? errores = null)
    {
        var problema = Crear(contexto, estado, titulo, mensaje, errores);

        contexto.Response.StatusCode = estado;
        contexto.Response.ContentType = "application/problem+json";
        await contexto.Response.WriteAsJsonAsync(
            problema,
            options: null,
            contentType: "application/problem+json",
            cancellationToken: contexto.RequestAborted);
    }
}
