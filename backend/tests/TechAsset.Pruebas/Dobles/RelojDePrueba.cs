using TechAsset.Application.Interfaces;

namespace TechAsset.Pruebas.Dobles;

// Reloj fijo para las reglas que dependen de la fecha (RN-04, vencimiento): las pruebas no usan la
// hora real.
public sealed class RelojDePrueba : IReloj
{
    public RelojDePrueba(DateOnly hoy)
    {
        Hoy = hoy;
    }

    public DateOnly Hoy { get; set; }

    public DateTimeOffset AhoraEnUtc => new(Hoy.ToDateTime(new TimeOnly(12, 0)), TimeSpan.Zero);

    public DateOnly HoyEnLima => Hoy;
}
