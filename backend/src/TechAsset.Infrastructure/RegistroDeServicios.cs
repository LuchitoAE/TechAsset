using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TechAsset.Application.Interfaces;
using TechAsset.Infrastructure.Consultas;
using TechAsset.Infrastructure.Persistencia;
using TechAsset.Infrastructure.Repositorios;
using TechAsset.Infrastructure.Servicios;

namespace TechAsset.Infrastructure;

// Conecta los contratos de Aplicación con PostgreSQL mediante EF Core. La cadena de conexión llega
// desde Program.cs, que la lee de la configuración (user-secrets en desarrollo).
public static class RegistroDeServicios
{
    public static IServiceCollection AgregarInfraestructura(
        this IServiceCollection servicios,
        string cadenaConexion)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(cadenaConexion);

        servicios.AddDbContext<ContextoDeTechAsset>(opciones =>
            opciones.UseNpgsql(cadenaConexion));

        servicios.AddScoped<IRepositorioDeUsuarios, RepositorioDeUsuarios>();
        servicios.AddScoped<IConsultaDeUsuarios, ConsultaDeUsuarios>();
        servicios.AddSingleton<IProtectorDeContrasenas, ProtectorPbkdf2>();
        servicios.AddSingleton<IReloj, RelojDelSistema>();

        return servicios;
    }
}
