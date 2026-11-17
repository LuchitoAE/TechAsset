using Microsoft.Extensions.DependencyInjection;
using TechAsset.Application.CasosDeUso;

namespace TechAsset.Application;

// Registra los casos de uso de la iteración 2: usuarios y acceso. Cada caso de uso es scoped porque
// comparte el contexto de EF Core de la petición.
public static class RegistroDeServicios
{
    public static IServiceCollection AgregarAplicacion(this IServiceCollection servicios)
    {
        servicios.AddScoped<RegistrarUsuarioCasoDeUso>();
        servicios.AddScoped<ActualizarUsuarioCasoDeUso>();
        servicios.AddScoped<ListarUsuariosCasoDeUso>();
        servicios.AddScoped<ObtenerUsuarioCasoDeUso>();
        servicios.AddScoped<CambiarEstadoUsuarioCasoDeUso>();
        servicios.AddScoped<IniciarSesionCasoDeUso>();
        servicios.AddScoped<ObtenerSesionCasoDeUso>();
        servicios.AddScoped<CerrarSesionCasoDeUso>();
        servicios.AddScoped<CrearPrimerAdministradorCasoDeUso>();

        return servicios;
    }
}
