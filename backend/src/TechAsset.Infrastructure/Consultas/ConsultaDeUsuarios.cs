using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Datos;
using TechAsset.Application.Interfaces;
using TechAsset.Infrastructure.Persistencia;

namespace TechAsset.Infrastructure.Consultas;

// Consulta de lectura de RF-03: filtra en la base, pagina con ORDER BY estable y proyecta solo los
// datos de la pantalla. No carga entidades (patrón de consultas separadas).
public sealed class ConsultaDeUsuarios(ContextoDeTechAsset contexto) : IConsultaDeUsuarios
{
    public async Task<PaginaDeUsuarios> ListarAsync(
        FiltroDeUsuarios filtro,
        CancellationToken cancellationToken = default)
    {
        var consulta = contexto.Usuarios.AsNoTracking();

        if (filtro.Texto is { } texto)
        {
            var patron = $"%{texto}%";
            consulta = consulta.Where(usuario =>
                EF.Functions.ILike(usuario.NombresUsuario, patron)
                || EF.Functions.ILike(usuario.ApellidosUsuario, patron)
                || EF.Functions.ILike(usuario.CorreoUsuario.Valor, patron));
        }

        if (filtro.Rol is { } rol)
        {
            consulta = consulta.Where(usuario => usuario.RolUsuario == rol);
        }

        if (filtro.Activo is { } activo)
        {
            consulta = consulta.Where(usuario => usuario.ActivoUsuario == activo);
        }

        if (filtro.Area is { } area)
        {
            var patronArea = $"%{area}%";
            consulta = consulta.Where(usuario => EF.Functions.ILike(usuario.AreaUsuario, patronArea));
        }

        var total = await consulta.CountAsync(cancellationToken);

        var usuarios = await consulta
            .OrderBy(usuario => usuario.ApellidosUsuario)
            .ThenBy(usuario => usuario.NombresUsuario)
            .Skip((filtro.Pagina - 1) * filtro.Tamano)
            .Take(filtro.Tamano)
            .Select(usuario => new DatosDeUsuario(
                usuario.IdUsuario,
                usuario.NombresUsuario,
                usuario.ApellidosUsuario,
                usuario.CorreoUsuario.Valor,
                usuario.AreaUsuario,
                usuario.RolUsuario,
                usuario.ActivoUsuario))
            .ToListAsync(cancellationToken);

        return new PaginaDeUsuarios(total, filtro.Pagina, filtro.Tamano, usuarios);
    }

    public Task<DatosDeUsuario?> ObtenerAsync(
        Guid idUsuario,
        CancellationToken cancellationToken = default) =>
        contexto.Usuarios
            .AsNoTracking()
            .Where(usuario => usuario.IdUsuario == idUsuario)
            .Select(usuario => new DatosDeUsuario(
                usuario.IdUsuario,
                usuario.NombresUsuario,
                usuario.ApellidosUsuario,
                usuario.CorreoUsuario.Valor,
                usuario.AreaUsuario,
                usuario.RolUsuario,
                usuario.ActivoUsuario))
            .FirstOrDefaultAsync(cancellationToken);
}
