using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace TechAsset.WebApi.Middleware;

// Convierte los errores de enlace de modelo en el mismo ProblemDetails con claves snake_case,
// para que el frontend lea siempre success, message y errors. Los mensajes del marco llegan en
// inglés; aquí se traducen los campos conocidos y se usa un mensaje claro en español para el resto.
public static class ErroresDeModelo
{
    public static IActionResult Crear(ActionContext contexto)
    {
        var errores = contexto.ModelState
            .Where(entrada => entrada.Value?.Errors.Count > 0)
            .ToDictionary(
                entrada => NormalizarClave(entrada.Key),
                entrada => entrada.Value!.Errors
                    .Select(_ => TraducirMensaje(NormalizarClave(entrada.Key)))
                    .ToArray());

        // Cuando el JSON falla en un campo concreto, el marco también marca «solicitud»; se deja
        // solo el error del campo para que el usuario sepa qué corregir.
        if (errores.Count > 1)
        {
            errores.Remove("solicitud");
        }

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

    // System.Text.Json usa claves como «$.categoria_equipo»; el cuerpo ausente usa «solicitud».
    private static string NormalizarClave(string clave)
    {
        var limpia = clave.StartsWith("$.", StringComparison.Ordinal) ? clave[2..] : clave;

        if (limpia is "$" or "")
        {
            return "solicitud";
        }

        return JsonNamingPolicy.SnakeCaseLower.ConvertName(limpia);
    }

    private static string TraducirMensaje(string campo)
    {
        if (campo.Contains("categoria_equipo", StringComparison.Ordinal))
        {
            return "La categoría debe ser Laptop, Computadora de escritorio, Monitor, Impresora, " +
                "Tablet, Proyector multimedia o Equipo de red.";
        }

        if (campo.Contains("estado_equipo", StringComparison.Ordinal))
        {
            return "El estado debe ser Disponible, Prestado, Mantenimiento o Baja.";
        }

        if (campo.Contains("rol_usuario", StringComparison.Ordinal))
        {
            return "El rol debe ser Administrador, ResponsableDeTecnologia o Colaborador.";
        }

        if (campo.Contains("estado_prestamo", StringComparison.Ordinal))
        {
            return "El estado del préstamo debe ser Solicitado, Activo, Devuelto o Rechazado.";
        }

        if (campo.Contains("fecha_devolucion", StringComparison.Ordinal))
        {
            return "La fecha de devolución debe tener el formato AAAA-MM-DD.";
        }

        if (campo.Contains("aprobado_prestamo", StringComparison.Ordinal))
        {
            return "Indique si el préstamo se aprueba o se rechaza.";
        }

        if (campo == "solicitud")
        {
            return "La solicitud es obligatoria y debe ser un JSON válido.";
        }

        return "El valor no es válido para este campo.";
    }
}
