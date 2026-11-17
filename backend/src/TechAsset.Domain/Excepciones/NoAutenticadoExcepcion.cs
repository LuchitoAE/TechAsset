namespace TechAsset.Domain.Excepciones;

// La sesión ya no es válida (usuario eliminado o deshabilitado): la API responde 401.
public sealed class NoAutenticadoExcepcion()
    : Exception("La sesión terminó. Vuelva a ingresar.");
