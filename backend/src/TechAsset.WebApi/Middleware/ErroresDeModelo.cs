using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace TechAsset.WebApi.Middleware;

// Convierte los errores de enlace de modelo en el mismo ProblemDetails con claves snake_case,
// para que el frontend lea siempre success, message y errors. Los mensajes del marco llegan en
// inglés; aquí se traducen los campos conocidos y se usa un mensaje claro en español para el resto.
public static class ErroresDeModelo
{
    private static readonly (string Fragmento, string Mensaje)[] MensajesConocidos =
    [
        ("categoria_equipo",
            "La categoría debe ser Laptop, Computadora de escritorio, Monitor, Impresora, " +
            "Tablet, Proyector multimedia o Equipo de red."),
        ("estado_equipo", "El estado debe ser Disponible, Prestado, Mantenimiento o Baja."),
        ("rol_usuario", "El rol debe ser Administrador, ResponsableDeTecnologia o Colaborador."),
        ("estado_prestamo",
            "El estado del préstamo debe ser Solicitado, Activo, Devuelto o Rechazado."),
        ("tipo_movimiento",
            "El tipo de movimiento debe ser EquipoRegistrado, EquipoActualizado, " +
            "EquipoEstadoCambiado, PrestamoSolicitado, PrestamoAprobado, PrestamoRechazado o " +
            "PrestamoDevuelto."),
        ("fecha_devolucion", "La fecha de devolución debe tener el formato AAAA-MM-DD."),
        ("aprobado_prestamo", "Indique si el préstamo se aprueba o se rechaza."),
    ];

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
        foreach (var (fragmento, mensaje) in MensajesConocidos)
        {
            if (campo.Contains(fragmento, StringComparison.Ordinal))
            {
                return mensaje;
            }
        }

        // «tipo» es el nombre corto que usa el reporte de movimientos en la cadena de consulta.
        if (campo == "tipo")
        {
            return MensajesConocidos
                .First(conocido => conocido.Fragmento == "tipo_movimiento").Mensaje;
        }

        return campo == "solicitud"
            ? "La solicitud es obligatoria y debe ser un JSON válido."
            : "El valor no es válido para este campo.";
    }
}
