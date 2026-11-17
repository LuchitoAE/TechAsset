namespace TechAsset.Domain.Excepciones;

// El rol de la sesión no alcanza para la operación: la API responde 403.
public sealed class AccesoDenegadoExcepcion(string mensaje) : Exception(mensaje);
