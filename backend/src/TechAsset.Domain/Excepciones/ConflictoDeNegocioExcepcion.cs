namespace TechAsset.Domain.Excepciones;

// Conflicto con una regla de negocio (correo duplicado, último administrador, etc.): la API responde 409.
public sealed class ConflictoDeNegocioExcepcion(string mensaje) : Exception(mensaje);
