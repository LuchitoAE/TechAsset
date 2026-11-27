namespace TechAsset.Application.Datos;

// Página del listado de usuarios: el total permite dibujar la paginación sin otra consulta.
public sealed record PaginaDeUsuarios(
    int Total,
    int Pagina,
    int Tamano,
    IReadOnlyList<DatosDeUsuario> Usuarios);
