using System.Text.Json;
using System.Text.Json.Serialization;
using TechAsset.Application;
using TechAsset.Domain.Comun;

var builder = WebApplication.CreateBuilder(args);

// Punto de composición: aquí se conectan las capas. La infraestructura se registra en la iteración 2,
// cuando exista la cadena de conexión y el contexto de EF Core.
builder.Services.AgregarAplicacion();

// La API responde en JSON con nombres en snake_case, como las columnas de la base (ESTANDARES.md).
builder.Services.ConfigureHttpJsonOptions(opciones =>
{
    opciones.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
    opciones.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseExceptionHandler();

// Comprobación de vida: no consulta la base de datos ni exige sesión.
app.MapGet("/api/salud", () => Results.Ok(new
{
    success = true,
    message = "TechAsset está en línea.",
    data = new { estado = "ok", producto = "TechAsset", version = VersionDelProducto.Valor }
}));

// Swagger solo en desarrollo: sirve para probar los endpoints a mano y no se publica.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(opciones =>
    {
        opciones.SwaggerEndpoint("/openapi/v1.json", "TechAsset v1");
        opciones.DocumentTitle = "TechAsset — API";
    });
}

app.Run();

// Necesario para que las pruebas de integración puedan hospedar la API en memoria.
public partial class Program { }
