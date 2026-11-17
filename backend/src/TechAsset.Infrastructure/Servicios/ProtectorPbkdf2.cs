using System.Security.Cryptography;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;

namespace TechAsset.Infrastructure.Servicios;

// Protección de contraseñas (D-14, RNF-16): PBKDF2-HMACSHA256, sal aleatoria de 16 bytes y 100 000
// iteraciones. El hash guarda el algoritmo y las iteraciones para poder migrarlo en el futuro.
public sealed class ProtectorPbkdf2 : IProtectorDeContrasenas
{
    public const int IteracionesPredeterminadas = 100_000;
    public const int LongitudSal = 16;
    public const int LongitudHash = 32;
    private const string Algoritmo = "PBKDF2-HMACSHA256";

    public ContrasenaProtegida Proteger(string contrasena)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(contrasena);

        var sal = RandomNumberGenerator.GetBytes(LongitudSal);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            contrasena,
            sal,
            IteracionesPredeterminadas,
            HashAlgorithmName.SHA256,
            LongitudHash);

        return new ContrasenaProtegida(
            Convert.ToBase64String(sal),
            $"{Algoritmo}${IteracionesPredeterminadas}${Convert.ToBase64String(hash)}");
    }

    public bool Verificar(string contrasena, string salContrasena, string hashContrasena)
    {
        if (string.IsNullOrEmpty(contrasena)
            || string.IsNullOrWhiteSpace(salContrasena)
            || string.IsNullOrWhiteSpace(hashContrasena))
        {
            return false;
        }

        try
        {
            var partes = hashContrasena.Split('$');
            if (partes.Length != 3
                || !string.Equals(partes[0], Algoritmo, StringComparison.Ordinal)
                || !int.TryParse(partes[1], out var iteraciones)
                || iteraciones < IteracionesPredeterminadas)
            {
                return false;
            }

            var sal = Convert.FromBase64String(salContrasena);
            var hashEsperado = Convert.FromBase64String(partes[2]);
            var hashCalculado = Rfc2898DeriveBytes.Pbkdf2(
                contrasena,
                sal,
                iteraciones,
                HashAlgorithmName.SHA256,
                hashEsperado.Length);

            return CryptographicOperations.FixedTimeEquals(hashCalculado, hashEsperado);
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
