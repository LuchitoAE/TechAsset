using Microsoft.EntityFrameworkCore;
using TechAsset.Domain.Entidades;

namespace TechAsset.Infrastructure.Persistencia;

// Contexto de EF Core de TechAsset. Las tablas y columnas se configuran en Persistencia/Configuraciones
// con nombres explícitos en snake_case (ESTANDARES.md).
public sealed class ContextoDeTechAsset(DbContextOptions<ContextoDeTechAsset> opciones)
    : DbContext(opciones)
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();

    public DbSet<Equipo> Equipos => Set<Equipo>();

    public DbSet<Prestamo> Prestamos => Set<Prestamo>();

    protected override void OnModelCreating(ModelBuilder modelo)
    {
        modelo.ApplyConfigurationsFromAssembly(typeof(ContextoDeTechAsset).Assembly);
    }
}
