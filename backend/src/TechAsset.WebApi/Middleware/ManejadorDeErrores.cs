using Microsoft.AspNetCore.Diagnostics;
using TechAsset.Domain.Excepciones;
using TechAsset.WebApi.Respuestas;

namespace TechAsset.WebApi.Middleware;

// Único lugar donde los errores se convierten en respuestas HTTP (ESTANDARES.md): ProblemDetails
// (RFC 9457) con success:false, message y errors por campo cuando corresponde.
public sealed class ManejadorDeErrores(ILogger<ManejadorDeErrores> registro)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext contexto,
        Exception excepcion,
        CancellationToken cancellationToken)
    {
        var (estado, titulo, mensaje, errores) = Traducir(excepcion);

        if (estado == StatusCodes.Status500InternalServerError)
        {
            registro.LogError(excepcion, "Error no controlado en {Ruta}", contexto.Request.Path);
        }

        await RespuestasDeError.EscribirAsync(contexto, estado, titulo, mensaje, errores);

        return true;
    }

    private static (int Estado, string Titulo, string Mensaje, IReadOnlyDictionary<string, string[]>? Errores)
        Traducir(Exception excepcion) => excepcion switch
        {
            DatosInvalidosExcepcion datos => (
                StatusCodes.Status400BadRequest,
                "Datos inválidos",
                datos.Message,
                datos.Errores),
            CredencialesInvalidasExcepcion credenciales => (
                StatusCodes.Status401Unauthorized,
                "No autorizado",
                credenciales.Message,
                null),
            NoAutenticadoExcepcion sesion => (
                StatusCodes.Status401Unauthorized,
                "No autorizado",
                sesion.Message,
                null),
            AccesoDenegadoExcepcion acceso => (
                StatusCodes.Status403Forbidden,
                "Acceso denegado",
                acceso.Message,
                null),
            RecursoNoEncontradoExcepcion noEncontrado => (
                StatusCodes.Status404NotFound,
                "No encontrado",
                noEncontrado.Message,
                null),
            ConflictoDeNegocioExcepcion conflicto => (
                StatusCodes.Status409Conflict,
                "Conflicto de negocio",
                conflicto.Message,
                null),
            _ => (
                StatusCodes.Status500InternalServerError,
                "Error interno",
                "No se pudo completar la operación. Intente nuevamente.",
                null)
        };
}
