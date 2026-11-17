using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TechAsset.Pruebas.WebApi;

// Fabrica la API en memoria con una cadena de conexión ficticia (los endpoints probados no consultan
// la base) y con la autenticación de prueba para poder comprobar 401 y 403.
public sealed class FabricaDePruebas : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder constructor)
    {
        constructor.UseEnvironment("Testing");

        constructor.ConfigureAppConfiguration((_, configuracion) =>
            configuracion.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:TechAsset"] =
                    "Host=127.0.0.1;Port=5432;Database=techasset_pruebas;Username=pruebas;Password=pruebas"
            }));

        constructor.ConfigureTestServices(servicios =>
            servicios
                .AddAuthentication(opciones =>
                {
                    opciones.DefaultAuthenticateScheme = AutenticacionDePrueba.Esquema;
                    opciones.DefaultChallengeScheme = AutenticacionDePrueba.Esquema;
                    opciones.DefaultScheme = AutenticacionDePrueba.Esquema;
                })
                .AddScheme<AuthenticationSchemeOptions, AutenticacionDePrueba>(
                    AutenticacionDePrueba.Esquema,
                    _ => { }));
    }
}
