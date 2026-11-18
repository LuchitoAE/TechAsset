using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TechAsset.Application.Interfaces;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.WebApi;

// Extiende la fábrica de pruebas con una consulta de préstamos en memoria: así los endpoints de
// lectura responden sin base de datos y se puede comprobar el rol y el alcance por sesión.
public sealed class FabricaDePruebasDePrestamos : FabricaDePruebas
{
    public ConsultaDePrestamosDePrueba Consulta { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder constructor)
    {
        base.ConfigureWebHost(constructor);

        constructor.ConfigureTestServices(servicios =>
        {
            servicios.RemoveAll<IConsultaDePrestamos>();
            servicios.AddSingleton<IConsultaDePrestamos>(Consulta);
        });
    }
}
