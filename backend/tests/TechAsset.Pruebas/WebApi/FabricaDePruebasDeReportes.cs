using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TechAsset.Application.Interfaces;
using TechAsset.Pruebas.Dobles;

namespace TechAsset.Pruebas.WebApi;

// Extiende la fábrica de pruebas con las cinco consultas de salida en memoria: así los endpoints de
// RF-13 a RF-17 responden sin base de datos y se puede comprobar el rol, el alcance y los filtros.
public sealed class FabricaDePruebasDeReportes : FabricaDePruebas
{
    public ConsultaDeSalidasDePrueba Consulta { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder constructor)
    {
        base.ConfigureWebHost(constructor);

        constructor.ConfigureTestServices(servicios =>
        {
            servicios.RemoveAll<IConsultaDeIndicadores>();
            servicios.AddSingleton<IConsultaDeIndicadores>(Consulta);

            servicios.RemoveAll<IConsultaDeEquiposPorEstado>();
            servicios.AddSingleton<IConsultaDeEquiposPorEstado>(Consulta);

            servicios.RemoveAll<IConsultaDeEquiposMasUtilizados>();
            servicios.AddSingleton<IConsultaDeEquiposMasUtilizados>(Consulta);

            servicios.RemoveAll<IConsultaDePrestamosPorArea>();
            servicios.AddSingleton<IConsultaDePrestamosPorArea>(Consulta);

            servicios.RemoveAll<IConsultaDeMovimientos>();
            servicios.AddSingleton<IConsultaDeMovimientos>(Consulta);
        });
    }
}
