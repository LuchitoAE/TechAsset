using TechAsset.Application.Interfaces;

namespace TechAsset.Infrastructure.Servicios;

// Reloj del sistema. Las marcas de tiempo van en UTC y las reglas de «hoy» usan America/Lima (RNF-20).
public sealed class RelojDelSistema : IReloj
{
    private static readonly TimeZoneInfo ZonaDeLima =
        TimeZoneInfo.FindSystemTimeZoneById("America/Lima");

    public DateTimeOffset AhoraEnUtc => DateTimeOffset.UtcNow;

    public DateOnly HoyEnLima =>
        DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ZonaDeLima));
}
