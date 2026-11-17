using Microsoft.Extensions.DependencyInjection;

namespace TechAsset.Infrastructure;

// Conecta los contratos de Aplicación con PostgreSQL; se completa en la iteración 2.
public static class RegistroDeServicios
{
    public static IServiceCollection AgregarInfraestructura(this IServiceCollection servicios, string cadenaConexion)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(cadenaConexion);

        return servicios;
    }
}
