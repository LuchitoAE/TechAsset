using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace TechAsset.WebApi.Middleware;

// Convierte los errores de enlace de modelo en el mismo ProblemDetails con claves snake_case,
// para que el frontend lea siempre success, message y errors.
public static class ErroresDeModelo
{
    public static IActionResult Crear(ActionContext contexto)
    {
        var errores = contexto.ModelState
            .Where(entrada => entrada.Value?.Errors.Count > 0)
            .ToDictionary(
                entrada => JsonNamingPolicy.SnakeCaseLower.ConvertName(entrada.Key),
                entrada => entrada.Value!.Errors
                    .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage)
                        ? "El valor no tiene el formato esperado."
                        : error.ErrorMessage)
                    .ToArray());

        var problema = new ProblemDetails
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Datos inválidos",
            Detail = "Revise los datos marcados.",
            Instance = contexto.HttpContext.Request.Path
        };

        problema.Extensions["success"] = false;
        problema.Extensions["message"] = "Revise los datos marcados.";
        problema.Extensions["errors"] = errores;

        return new ObjectResult(problema)
        {
            StatusCode = StatusCodes.Status400BadRequest,
            ContentTypes = { "application/problem+json" }
        };
    }
}
