namespace TechAsset.Application.Datos;

// Filtro de RF-15: cuántas filas del ranking se muestran. Por defecto diez y como máximo cien, para
// que el reporte pueda verse completo sin castigar la consulta (D-09).
public sealed record FiltroDeEquiposMasUtilizados(int Limite)
{
    public const int LimitePredeterminado = 10;
    public const int LimiteMaximo = 100;

    public static FiltroDeEquiposMasUtilizados Normalizar(int limite) => new(
        limite is < 1 or > LimiteMaximo ? LimitePredeterminado : limite);
}
