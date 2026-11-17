using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Pruebas.WebApi;

namespace TechAsset.Pruebas.WebApi;

// La API exige sesión en todo salvo salud e ingreso, y comprueba el rol antes de llegar al controlador.
public class PruebasDePermisos(FabricaDePruebas fabrica) : IClassFixture<FabricaDePruebas>
{
    [Fact]
    public async Task SinSesionElListadoDeUsuariosResponde401()
    {
        var cliente = fabrica.CreateClient();

        var respuesta = await cliente.GetAsync("/api/usuarios");

        Assert.Equal(HttpStatusCode.Unauthorized, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        Assert.False(documento.RootElement.GetProperty("success").GetBoolean());
        Assert.False(string.IsNullOrWhiteSpace(documento.RootElement.GetProperty("message").GetString()));
    }

    [Fact]
    public async Task SinSesionLaConsultaDeSesionResponde401()
    {
        var cliente = fabrica.CreateClient();

        var respuesta = await cliente.GetAsync("/api/autenticacion/sesion");

        Assert.Equal(HttpStatusCode.Unauthorized, respuesta.StatusCode);
    }

    [Fact]
    public async Task ElColaboradorNoPuedeConsultarElListadoDeUsuarios()
    {
        var cliente = fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Colaborador));

        var respuesta = await cliente.GetAsync("/api/usuarios");

        Assert.Equal(HttpStatusCode.Forbidden, respuesta.StatusCode);
    }

    [Fact]
    public async Task ElColaboradorNoPuedeRegistrarUsuarios()
    {
        var cliente = fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Colaborador));

        var respuesta = await cliente.PostAsJsonAsync("/api/usuarios", new
        {
            nombres_usuario = "Ana",
            apellidos_usuario = "Pérez",
            correo_usuario = "ana.perez@innovatech.pe",
            area_usuario = "Tecnología",
            rol_usuario = "Colaborador",
            contrasena = "Clave1234"
        });

        Assert.Equal(HttpStatusCode.Forbidden, respuesta.StatusCode);
    }

    [Fact]
    public async Task ElColaboradorNoPuedeDeshabilitarUsuarios()
    {
        var cliente = fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Colaborador));

        var respuesta = await cliente.PatchAsJsonAsync(
            "/api/usuarios/00000000-0000-0000-0000-000000000001/estado",
            new { activo_usuario = false });

        Assert.Equal(HttpStatusCode.Forbidden, respuesta.StatusCode);
    }
}
