using TechAsset.Application.Datos;

namespace TechAsset.Application.Interfaces;

// Estrategia de protección de contraseñas (patrón Strategy). La implementación PBKDF2 está en
// Infrastructure y puede cambiarse sin tocar los casos de uso (D-14).
public interface IProtectorDeContrasenas
{
    ContrasenaProtegida Proteger(string contrasena);

    bool Verificar(string contrasena, string salContrasena, string hashContrasena);
}
