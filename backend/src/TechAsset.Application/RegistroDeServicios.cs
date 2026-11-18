using Microsoft.Extensions.DependencyInjection;
using TechAsset.Application.CasosDeUso;

namespace TechAsset.Application;

// Registra los casos de uso de las iteraciones 2, 3 y 4: usuarios, acceso, inventario y préstamos.
// Cada caso de uso es scoped porque comparte el contexto de EF Core de la petición.
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

        servicios.AddScoped<RegistrarEquipoCasoDeUso>();
        servicios.AddScoped<ActualizarEquipoCasoDeUso>();
        servicios.AddScoped<ListarEquiposCasoDeUso>();
        servicios.AddScoped<ObtenerEquipoCasoDeUso>();
        servicios.AddScoped<CambiarEstadoEquipoCasoDeUso>();

        servicios.AddScoped<SolicitarPrestamoCasoDeUso>();
        servicios.AddScoped<AprobarPrestamoCasoDeUso>();
        servicios.AddScoped<RechazarPrestamoCasoDeUso>();
        servicios.AddScoped<RegistrarDevolucionCasoDeUso>();
        servicios.AddScoped<ListarPrestamosCasoDeUso>();
        servicios.AddScoped<ListarPrestamosActivosCasoDeUso>();
        servicios.AddScoped<ObtenerPrestamoCasoDeUso>();

        return servicios;
    }
}
