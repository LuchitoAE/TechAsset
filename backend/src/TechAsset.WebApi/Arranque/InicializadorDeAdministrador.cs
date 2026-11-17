using TechAsset.Application.CasosDeUso;
using TechAsset.Application.Comandos;

namespace TechAsset.WebApi.Arranque;

// Crea el primer Administrador al arrancar la API si no hay ninguno activo. Los datos se leen de la
// configuración segura (AdministradorInicial en user-secrets o variables de entorno), no del repositorio.
public sealed class InicializadorDeAdministrador(
    IConfiguration configuracion,
    CrearPrimerAdministradorCasoDeUso casoDeUso,
    ILogger<InicializadorDeAdministrador> registro)
{
    public async Task EjecutarAsync(CancellationToken cancellationToken = default)
    {
        var seccion = configuracion.GetSection("AdministradorInicial");

        if (string.IsNullOrWhiteSpace(seccion["CorreoUsuario"]))
        {
            registro.LogInformation(
                "No hay AdministradorInicial configurado; se omite la creación de la cuenta inicial.");
            return;
        }

        var creado = await casoDeUso.EjecutarAsync(
            new CrearPrimerAdministradorComando(
                seccion["NombresUsuario"],
                seccion["ApellidosUsuario"],
                seccion["CorreoUsuario"],
                seccion["AreaUsuario"],
                seccion["Contrasena"]),
            cancellationToken);

        if (creado)
        {
            registro.LogInformation("Se creó el primer Administrador de TechAsset.");
        }
    }
}
