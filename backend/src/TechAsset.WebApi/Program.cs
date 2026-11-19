using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authorization;
using TechAsset.Application;
using TechAsset.Domain.Comun;
using TechAsset.Infrastructure;
using TechAsset.WebApi.Arranque;
using TechAsset.WebApi.Middleware;
using TechAsset.WebApi.Seguridad;

var builder = WebApplication.CreateBuilder(args);

// Punto de composición: aquí se conectan las capas. La cadena de conexión vive en user-secrets en
// desarrollo y en variables de entorno al publicar (RNF-19); nunca en el repositorio.
builder.Services.AgregarAplicacion();

var cadenaConexion = builder.Configuration.GetConnectionString("TechAsset");

if (string.IsNullOrWhiteSpace(cadenaConexion))
{
    if (builder.Environment.IsEnvironment("Testing"))
    {
        // Las pruebas de la API no consultan la base; se usa una cadena inalcanzable a propósito.
        cadenaConexion =
            "Host=127.0.0.1;Port=1;Database=techasset_pruebas;Username=pruebas;Password=pruebas;Timeout=1";
    }
    else
    {
        throw new InvalidOperationException(
            "Falta ConnectionStrings:TechAsset. Configúrela con «dotnet user-secrets set " +
            "\"ConnectionStrings:TechAsset\" \"...\"» o con una variable de entorno.");
    }
}

builder.Services.AgregarInfraestructura(cadenaConexion);

// La API responde en JSON snake_case, con los enums como texto y sin propiedades nulas.
static void ConfigurarJson(JsonSerializerOptions opciones)
{
    opciones.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
    opciones.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    opciones.Converters.Add(new JsonStringEnumConverter(namingPolicy: null, allowIntegerValues: false));
}

builder.Services.ConfigureHttpJsonOptions(opciones => ConfigurarJson(opciones.SerializerOptions));

builder.Services
    .AddControllers()
    .AddJsonOptions(opciones => ConfigurarJson(opciones.JsonSerializerOptions))
    .ConfigureApiBehaviorOptions(opciones =>
        opciones.InvalidModelStateResponseFactory = ErroresDeModelo.Crear);

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ManejadorDeErrores>();
builder.Services.AddOpenApi();

// Sesión con cookie HttpOnly y SameSite=Strict; todo exige sesión salvo el ingreso, la salida y la salud.
builder.Services.AgregarSesionDeTechAsset();
builder.Services.AddAuthorization(opciones =>
{
    opciones.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    opciones.AddPolicy(
        PoliticasDeAcceso.Administrador,
        politica => politica.RequireRole(PoliticasDeAcceso.Administrador));
    opciones.AddPolicy(
        PoliticasDeAcceso.ResponsableDeTecnologia,
        politica => politica.RequireRole(PoliticasDeAcceso.ResponsableDeTecnologia));
    opciones.AddPolicy(
        PoliticasDeAcceso.Colaborador,
        politica => politica.RequireRole(PoliticasDeAcceso.Colaborador));
});

builder.Services.AddSingleton<LimiteDeIntentosDeIngreso>();
builder.Services.AddScoped<FiltroDeIntentosDeIngreso>();
builder.Services.AddScoped<InicializadorDeAdministrador>();

var app = builder.Build();

app.UseExceptionHandler();

// Crear el primer Administrador es idempotente y solo ocurre si hay configuración para ello.
using (var alcance = app.Services.CreateScope())
{
    var inicializador = alcance.ServiceProvider.GetRequiredService<InicializadorDeAdministrador>();
    await inicializador.EjecutarAsync();
}

// Comprobación de vida: no consulta la base de datos ni exige sesión.
app.MapGet("/api/salud", () => Results.Ok(new
{
    success = true,
    message = "TechAsset está en línea.",
    data = new { estado = "ok", producto = "TechAsset", version = VersionDelProducto.Valor }
})).AllowAnonymous();

// Swagger solo en desarrollo: va antes de la autenticación para que su página no quede detrás de la
// política «todo exige sesión» (su UI no es un endpoint de la API).
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();
    app.UseSwaggerUI(opciones =>
    {
        opciones.SwaggerEndpoint("/openapi/v1.json", "TechAsset v1");
        opciones.DocumentTitle = "TechAsset — API";
    });
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Necesario para que las pruebas de integración puedan hospedar la API en memoria.
public partial class Program { }
