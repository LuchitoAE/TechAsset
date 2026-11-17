using TechAsset.Domain.Excepciones;

namespace TechAsset.Domain.Comun;

// Objeto de valor del código patrimonial (RN-07): se guarda sin espacios al inicio ni al final y
// en mayúsculas, con un máximo de 50 caracteres. Un código inválido no puede circular por el sistema.
public sealed class CodigoPatrimonial
{
    public const int LongitudMaxima = 50;

    private CodigoPatrimonial()
    {
        Valor = string.Empty;
    }

    private CodigoPatrimonial(string valor)
    {
        Valor = valor;
    }

    public string Valor { get; private set; }

    public static CodigoPatrimonial Crear(string? codigo)
    {
        var valor = (codigo ?? string.Empty).Trim().ToUpperInvariant();

        if (valor.Length == 0)
        {
            throw new DatosInvalidosExcepcion(
                CamposDeEquipo.CodigoPatrimonialEquipo,
                "El código patrimonial es obligatorio.");
        }

        if (valor.Length > LongitudMaxima)
        {
            throw new DatosInvalidosExcepcion(
                CamposDeEquipo.CodigoPatrimonialEquipo,
                $"El código patrimonial no puede superar los {LongitudMaxima} caracteres.");
        }

        return new CodigoPatrimonial(valor);
    }

    public override string ToString() => Valor;
}
