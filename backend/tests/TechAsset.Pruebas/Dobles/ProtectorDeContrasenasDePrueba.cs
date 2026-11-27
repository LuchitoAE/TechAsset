using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;

namespace TechAsset.Pruebas.Dobles;

// Protector rápido para las pruebas de casos de uso: mantiene la contraseña en el hash de prueba.
// El protector real (PBKDF2) se prueba aparte con sus propias verificaciones.
public sealed class ProtectorDeContrasenasDePrueba : IProtectorDeContrasenas
{
    public ContrasenaProtegida Proteger(string contrasena) =>
        new("c2FsLWRlLXBydWViYQ==", $"PBKDF2-HMACSHA256$100000${contrasena}");

    public bool Verificar(string contrasena, string salContrasena, string hashContrasena) =>
        hashContrasena.EndsWith($"${contrasena}", StringComparison.Ordinal);
}
