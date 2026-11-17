using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;

namespace TechAsset.Pruebas.Dobles;

// Repositorio en memoria para probar los casos de uso sin PostgreSQL. Conserva la semántica de
// correo único y de conteo de Administradores activos.
public sealed class RepositorioDeUsuariosEnMemoria : IRepositorioDeUsuarios
{
    private readonly List<Usuario> _usuarios = [];

    public IReadOnlyList<Usuario> Usuarios => _usuarios;

    public void Sembrar(params Usuario[] usuarios) => _usuarios.AddRange(usuarios);

    public Task<Usuario?> ObtenerPorIdAsync(
        Guid idUsuario,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(_usuarios.FirstOrDefault(usuario => usuario.IdUsuario == idUsuario));

    public Task<Usuario?> ObtenerPorCorreoAsync(
        CorreoElectronico correoUsuario,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(_usuarios.FirstOrDefault(usuario =>
            usuario.CorreoUsuario.Valor == correoUsuario.Valor));

    public Task<bool> ExisteCorreoAsync(
        CorreoElectronico correoUsuario,
        Guid? exceptoIdUsuario,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(_usuarios.Any(usuario =>
            usuario.CorreoUsuario.Valor == correoUsuario.Valor
            && (exceptoIdUsuario is null || usuario.IdUsuario != exceptoIdUsuario)));

    public Task<int> ContarAdministradoresActivosAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult(_usuarios.Count(usuario => usuario.EsAdministradorActivo));

    public Task AgregarAsync(Usuario usuario, CancellationToken cancellationToken = default)
    {
        _usuarios.Add(usuario);
        return Task.CompletedTask;
    }

    public Task GuardarCambiosAsync(CancellationToken cancellationToken = default) =>
        Task.CompletedTask;
}
