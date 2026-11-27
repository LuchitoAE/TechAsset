using System.Collections.Concurrent;
using TechAsset.Application.Interfaces;

namespace TechAsset.WebApi.Seguridad;

// Endurecimiento de RN-11: cuenta los ingresos fallidos por correo y dirección de origen y bloquea
// la combinación durante un minuto tras cinco fallos. Solo cuentan los intentos rechazados, así que
// un usuario que ingresa correctamente no se bloquea por repetir el ingreso. La ventana se reinicia
// sola y no se guarda en la base: al reiniciar la API se liberan todos los bloqueos.
public sealed class LimiteDeIntentosDeIngreso(IReloj reloj)
{
    public const int FallosPermitidos = 5;
    public const int SegundosDeBloqueo = 60;

    public static readonly TimeSpan Ventana = TimeSpan.FromSeconds(SegundosDeBloqueo);

    private readonly ConcurrentDictionary<string, RegistroDeFallos> _registros =
        new(StringComparer.Ordinal);

    public bool EstaBloqueado(string? correoUsuario, string? direccionOrigen)
    {
        var clave = Clave(correoUsuario, direccionOrigen);

        if (!_registros.TryGetValue(clave, out var registro))
        {
            return false;
        }

        if (YaPasoLaVentana(registro, reloj.AhoraEnUtc))
        {
            _registros.TryRemove(clave, out _);
            return false;
        }

        return registro.Fallos >= FallosPermitidos;
    }

    public void RegistrarFallo(string? correoUsuario, string? direccionOrigen)
    {
        var ahora = reloj.AhoraEnUtc;
        var clave = Clave(correoUsuario, direccionOrigen);

        _registros.AddOrUpdate(
            clave,
            _ => new RegistroDeFallos(ahora, 1),
            (_, actual) => YaPasoLaVentana(actual, ahora)
                ? new RegistroDeFallos(ahora, 1)
                : actual with { Fallos = actual.Fallos + 1 });
    }

    public void RegistrarExito(string? correoUsuario, string? direccionOrigen) =>
        _registros.TryRemove(Clave(correoUsuario, direccionOrigen), out _);

    private bool YaPasoLaVentana(RegistroDeFallos registro, DateTimeOffset ahora) =>
        ahora - registro.Inicio >= Ventana;

    // El correo se normaliza igual que el objeto de valor para que cambiar mayúsculas no abra una
    // ventana nueva; la IP separa a dos personas que comparten un correo mal escrito.
    private static string Clave(string? correoUsuario, string? direccionOrigen) =>
        $"{(correoUsuario ?? string.Empty).Trim().ToLowerInvariant()}|{direccionOrigen ?? "sin-ip"}";

    private readonly record struct RegistroDeFallos(DateTimeOffset Inicio, int Fallos);
}
