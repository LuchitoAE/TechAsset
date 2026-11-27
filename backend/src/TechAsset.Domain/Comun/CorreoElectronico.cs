using System.Text.RegularExpressions;
using TechAsset.Domain.Excepciones;

namespace TechAsset.Domain.Comun;

// Objeto de valor del correo: se guarda en minúsculas, sin espacios y con un formato válido.
// Al ser un objeto de valor, un correo inválido no puede circular por el sistema.
public sealed partial class CorreoElectronico
{
    public const int LongitudMaxima = 150;

    private CorreoElectronico()
    {
        Valor = string.Empty;
    }

    private CorreoElectronico(string valor)
    {
        Valor = valor;
    }

    public string Valor { get; private set; }

    public static CorreoElectronico Crear(string? correo)
    {
        var valor = (correo ?? string.Empty).Trim().ToLowerInvariant();

        if (valor.Length == 0)
        {
            throw new DatosInvalidosExcepcion(CamposDeUsuario.CorreoUsuario, "El correo es obligatorio.");
        }

        if (valor.Length > LongitudMaxima)
        {
            throw new DatosInvalidosExcepcion(
                CamposDeUsuario.CorreoUsuario,
                $"El correo no puede superar los {LongitudMaxima} caracteres.");
        }

        if (!PatronDeCorreo().IsMatch(valor))
        {
            throw new DatosInvalidosExcepcion(
                CamposDeUsuario.CorreoUsuario,
                "Escriba un correo válido, por ejemplo nombre@innovatech.pe.");
        }

        return new CorreoElectronico(valor);
    }

    public override string ToString() => Valor;

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$", RegexOptions.CultureInvariant)]
    private static partial Regex PatronDeCorreo();
}
