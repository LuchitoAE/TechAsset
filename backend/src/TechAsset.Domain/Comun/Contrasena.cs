using TechAsset.Domain.Excepciones;

namespace TechAsset.Domain.Comun;

// Reglas de la contraseña (RN-11): de 8 a 64 caracteres, con mayúscula, minúscula y número.
// La regla vive en el dominio para que la API y la interfaz hablen de lo mismo.
public static class Contrasena
{
    public const int LongitudMinima = 8;
    public const int LongitudMaxima = 64;

    // Devuelve el detalle por campo para que la API lo publique en errors.
    public static IReadOnlyDictionary<string, string[]> Validar(string? contrasena)
    {
        var valor = contrasena ?? string.Empty;
        var errores = new List<string>();

        if (valor.Length == 0)
        {
            errores.Add("La contraseña es obligatoria.");
        }
        else
        {
            if (valor.Length < LongitudMinima || valor.Length > LongitudMaxima)
            {
                errores.Add($"La contraseña debe tener entre {LongitudMinima} y {LongitudMaxima} caracteres.");
            }

            if (!valor.Any(char.IsUpper))
            {
                errores.Add("La contraseña debe incluir al menos una mayúscula.");
            }

            if (!valor.Any(char.IsLower))
            {
                errores.Add("La contraseña debe incluir al menos una minúscula.");
            }

            if (!valor.Any(char.IsDigit))
            {
                errores.Add("La contraseña debe incluir al menos un número.");
            }
        }

        return errores.Count == 0
            ? new Dictionary<string, string[]>()
            : new Dictionary<string, string[]> { [CamposDeUsuario.Contrasena] = [.. errores] };
    }

    public static void ExigirValida(string? contrasena)
    {
        var errores = Validar(contrasena);
        if (errores.Count > 0)
        {
            throw new DatosInvalidosExcepcion(errores);
        }
    }
}
