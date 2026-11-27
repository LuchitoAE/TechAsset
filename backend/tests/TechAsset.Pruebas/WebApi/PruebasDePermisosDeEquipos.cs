using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Pruebas.WebApi;

// RF-05 a RF-08 y RNF-18: el inventario se consulta con cualquier rol, pero solo el Administrador
// y el Responsable de Tecnología escriben. La consulta de prueba evita la base de datos.
public class PruebasDePermisosDeEquipos(FabricaDePruebasDeEquipos fabrica)
    : IClassFixture<FabricaDePruebasDeEquipos>
{
    [Fact]
    public async Task SinSesionElInventarioResponde401()
    {
        var cliente = fabrica.CreateClient();

        var respuesta = await cliente.GetAsync("/api/equipos");

        Assert.Equal(HttpStatusCode.Unauthorized, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        Assert.False(documento.RootElement.GetProperty("success").GetBoolean());
        Assert.False(string.IsNullOrWhiteSpace(documento.RootElement.GetProperty("message").GetString()));
    }

    [Fact]
    public async Task SinSesionNoSePuedeRegistrarUnEquipo()
    {
        var cliente = fabrica.CreateClient();

        var respuesta = await cliente.PostAsJsonAsync("/api/equipos", new { });

        Assert.Equal(HttpStatusCode.Unauthorized, respuesta.StatusCode);
    }

    [Theory]
    [InlineData(nameof(RolUsuario.Administrador))]
    [InlineData(nameof(RolUsuario.ResponsableDeTecnologia))]
    [InlineData(nameof(RolUsuario.Colaborador))]
    public async Task LosTresRolesConsultanElInventario(string rol)
    {
        var cliente = fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, rol);

        var respuesta = await cliente.GetAsync("/api/equipos");

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        var datos = documento.RootElement.GetProperty("data");

        Assert.Equal(1, datos.GetProperty("total").GetInt32());
        Assert.Equal(
            "TK-2026-0001",
            datos.GetProperty("equipos")[0].GetProperty("codigo_patrimonial_equipo").GetString());
        Assert.True(datos.GetProperty("equipos")[0].GetProperty("disponible_equipo").GetBoolean());
        Assert.Equal(
            nameof(EstadoEquipo.Disponible),
            datos.GetProperty("conteo_por_estado")[0].GetProperty("estado_equipo").GetString());
    }

    [Fact]
    public async Task ElColaboradorNoPuedeRegistrarEquipos()
    {
        var cliente = fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Colaborador));

        var respuesta = await cliente.PostAsJsonAsync("/api/equipos", new
        {
            codigo_patrimonial_equipo = "TK-2026-0002",
            nombre_equipo = "Laptop HP",
            categoria_equipo = "Laptop",
            marca_equipo = "HP",
            estado_equipo = "Disponible"
        });

        Assert.Equal(HttpStatusCode.Forbidden, respuesta.StatusCode);
    }

    [Fact]
    public async Task ElColaboradorNoPuedeActualizarEquipos()
    {
        var cliente = fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Colaborador));

        var respuesta = await cliente.PutAsJsonAsync(
            $"/api/equipos/{Dobles.ConsultaDeEquiposDePrueba.IdEquipo}",
            new
            {
                codigo_patrimonial_equipo = "TK-2026-0001",
                nombre_equipo = "Laptop HP",
                categoria_equipo = "Laptop",
                marca_equipo = "HP"
            });

        Assert.Equal(HttpStatusCode.Forbidden, respuesta.StatusCode);
    }

    [Fact]
    public async Task ElColaboradorNoPuedeCambiarElEstado()
    {
        var cliente = fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Colaborador));

        var respuesta = await cliente.PatchAsJsonAsync(
            $"/api/equipos/{Dobles.ConsultaDeEquiposDePrueba.IdEquipo}/estado",
            new { estado_equipo = "Baja" });

        Assert.Equal(HttpStatusCode.Forbidden, respuesta.StatusCode);
    }

    [Fact]
    public async Task LaConsultaNormalizaYEntregaLosFiltros()
    {
        var cliente = fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Colaborador));

        var respuesta = await cliente.GetAsync(
            "/api/equipos?texto=%20dell%20&estado=Mantenimiento&categoria=Laptop&marca=Dell&pagina=2&tamano=5");

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);

        var filtro = fabrica.Consulta.UltimoFiltro;
        Assert.NotNull(filtro);
        Assert.Equal("dell", filtro!.Texto);
        Assert.Equal(EstadoEquipo.Mantenimiento, filtro.Estado);
        Assert.Equal(CategoriaEquipo.Laptop, filtro.Categoria);
        Assert.Equal("Dell", filtro.Marca);
        Assert.Equal(2, filtro.Pagina);
        Assert.Equal(5, filtro.Tamano);
    }

    [Fact]
    public async Task CualquierRolConsultaElDetalleDeUnEquipo()
    {
        var cliente = fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Colaborador));

        var respuesta = await cliente.GetAsync(
            $"/api/equipos/{Dobles.ConsultaDeEquiposDePrueba.IdEquipo}");

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        Assert.Equal(
            "Dell",
            documento.RootElement.GetProperty("data").GetProperty("marca_equipo").GetString());
    }

    [Fact]
    public async Task UnaCategoriaInvalidaResponde400ConMensajeEnEspanol()
    {
        var cliente = fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Administrador));

        var respuesta = await cliente.PostAsJsonAsync("/api/equipos", new
        {
            codigo_patrimonial_equipo = "TK-2026-0003",
            nombre_equipo = "Equipo raro",
            categoria_equipo = "Servidor",
            marca_equipo = "Genérica",
            estado_equipo = "Disponible"
        });

        Assert.Equal(HttpStatusCode.BadRequest, respuesta.StatusCode);

        using var documento = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        var mensajes = documento.RootElement.GetProperty("errors").GetProperty("categoria_equipo");

        Assert.Contains("categoría", mensajes[0].GetString(), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task UnEquipoInexistenteResponde404()
    {
        var cliente = fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add(AutenticacionDePrueba.EncabezadoDeRol, nameof(RolUsuario.Colaborador));

        var respuesta = await cliente.GetAsync($"/api/equipos/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, respuesta.StatusCode);
    }
}
