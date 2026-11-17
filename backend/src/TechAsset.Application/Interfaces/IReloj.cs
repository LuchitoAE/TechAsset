namespace TechAsset.Application.Interfaces;

// Reloj del sistema: las reglas que dependen de la fecha se prueban sin depender de la hora real.
public interface IReloj
{
    DateTimeOffset AhoraEnUtc { get; }

    DateOnly HoyEnLima { get; }
}
