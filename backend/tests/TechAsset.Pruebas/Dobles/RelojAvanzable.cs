using TechAsset.Application.Interfaces;

namespace TechAsset.Pruebas.Dobles;

// Reloj que se puede mover a mano para probar ventanas de tiempo (por ejemplo, el límite de
// intentos de ingreso) sin esperar un minuto real.
public sealed class RelojAvanzable(DateTimeOffset? ahora = null) : IReloj
{
    public DateTimeOffset Ahora { get; set; } =
        ahora ?? new DateTimeOffset(2026, 11, 18, 12, 0, 0, TimeSpan.Zero);

    public DateTimeOffset AhoraEnUtc => Ahora;

    public DateOnly HoyEnLima => DateOnly.FromDateTime(Ahora.UtcDateTime);

    public void Avanzar(TimeSpan tiempo) => Ahora += tiempo;
}
