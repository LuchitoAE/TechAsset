using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TechAsset.Application.Interfaces;
using TechAsset.Pruebas.Dobles;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Pruebas.WebApi;

// API en memoria con el repositorio de usuarios y el protector de prueba: permite ejercitar el
// ingreso real (RN-11) y su límite de intentos sin PostgreSQL.
public sealed class FabricaDePruebasDeAcceso : FabricaDePruebas
{
    public const string Correo = "ana.perez@innovatech.pe";

    public RepositorioDeUsuariosEnMemoria Repositorio { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder constructor)
    {
        Repositorio.Sembrar(FabricaDeUsuarios.Crear(Correo, RolUsuario.Colaborador));

        base.ConfigureWebHost(constructor);

        constructor.ConfigureTestServices(servicios =>
        {
            servicios.RemoveAll<IRepositorioDeUsuarios>();
            servicios.AddSingleton<IRepositorioDeUsuarios>(Repositorio);
            servicios.RemoveAll<IProtectorDeContrasenas>();
            servicios.AddSingleton<IProtectorDeContrasenas, ProtectorDeContrasenasDePrueba>();
        });
    }
}
