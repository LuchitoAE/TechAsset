using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;
using TechAsset.Infrastructure.Persistencia;

namespace TechAsset.Infrastructure.Repositorios;

// Implementación del repositorio de usuarios sobre EF Core. Las lecturas de actualización usan
// seguimiento; las de solo lectura, AsNoTracking.
public sealed class RepositorioDeUsuarios(ContextoDeTechAsset contexto) : IRepositorioDeUsuarios
{
    public Task<Usuario?> ObtenerPorIdAsync(
        Guid idUsuario,
        CancellationToken cancellationToken = default) =>
        contexto.Usuarios.FirstOrDefaultAsync(
            usuario => usuario.IdUsuario == idUsuario,
            cancellationToken);

    public Task<Usuario?> ObtenerPorCorreoAsync(
        CorreoElectronico correoUsuario,
        CancellationToken cancellationToken = default) =>
        contexto.Usuarios
            .AsNoTracking()
            .FirstOrDefaultAsync(
                usuario => usuario.CorreoUsuario.Valor == correoUsuario.Valor,
                cancellationToken);

    public Task<bool> ExisteCorreoAsync(
        CorreoElectronico correoUsuario,
        Guid? exceptoIdUsuario,
        CancellationToken cancellationToken = default) =>
        contexto.Usuarios.AnyAsync(
            usuario => usuario.CorreoUsuario.Valor == correoUsuario.Valor
                && (exceptoIdUsuario == null || usuario.IdUsuario != exceptoIdUsuario),
            cancellationToken);

    public Task<int> ContarAdministradoresActivosAsync(CancellationToken cancellationToken = default) =>
        contexto.Usuarios.CountAsync(
            usuario => usuario.ActivoUsuario && usuario.RolUsuario == RolUsuario.Administrador,
            cancellationToken);

    public async Task AgregarAsync(Usuario usuario, CancellationToken cancellationToken = default) =>
        await contexto.Usuarios.AddAsync(usuario, cancellationToken);

    public Task GuardarCambiosAsync(CancellationToken cancellationToken = default) =>
        contexto.SaveChangesAsync(cancellationToken);
}
