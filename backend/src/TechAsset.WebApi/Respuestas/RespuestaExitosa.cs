namespace TechAsset.WebApi.Respuestas;

// Formato único de las respuestas exitosas: { success, message, data } (ESTANDARES.md).
public sealed record RespuestaExitosa<T>(bool Success, string Message, T Data);

// Ayuda a construir la respuesta exitosa sin repetir el formato en cada controlador.
public static class RespuestasDeLaApi
{
    public static RespuestaExitosa<T> Exitosa<T>(T data, string message) => new(true, message, data);
}
