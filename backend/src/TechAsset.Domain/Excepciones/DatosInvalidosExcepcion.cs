namespace TechAsset.Domain.Excepciones;

// Error de validación de datos: la API lo devuelve como 400 con el detalle por campo.
public sealed class DatosInvalidosExcepcion : Exception
{
    public DatosInvalidosExcepcion(IReadOnlyDictionary<string, string[]> errores)
        : base("Revise los datos marcados.")
    {
        Errores = errores;
    }

    public DatosInvalidosExcepcion(string campo, string mensaje)
        : this(new Dictionary<string, string[]> { [campo] = [mensaje] })
    {
    }

    public IReadOnlyDictionary<string, string[]> Errores { get; }
}
