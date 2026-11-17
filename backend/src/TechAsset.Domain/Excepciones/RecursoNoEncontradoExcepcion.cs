namespace TechAsset.Domain.Excepciones;

// El recurso pedido no existe: la API responde 404.
public sealed class RecursoNoEncontradoExcepcion(string mensaje) : Exception(mensaje);
