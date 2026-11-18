using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Infrastructure.Persistencia.Configuraciones;

// Traduce Equipo a la tabla equipos con columnas snake_case y las restricciones del SDD:
// código patrimonial único (RN-07) y estado dentro del catálogo.
public sealed class ConfiguracionDeEquipo : IEntityTypeConfiguration<Equipo>
{
    public void Configure(EntityTypeBuilder<Equipo> constructor)
    {
        constructor.ToTable("equipos", tabla =>
            tabla.HasCheckConstraint(
                "ck_equipos_estado",
                "estado_equipo IN ('Disponible', 'Prestado', 'Mantenimiento', 'Baja')"));

        constructor.HasKey(equipo => equipo.IdEquipo).HasName("pk_equipos");

        constructor.Property(equipo => equipo.IdEquipo)
            .HasColumnName("id_equipo");

        constructor.OwnsOne(equipo => equipo.CodigoPatrimonial, codigo =>
        {
            codigo.Property(valor => valor.Valor)
                .HasColumnName("codigo_patrimonial_equipo")
                .HasMaxLength(CodigoPatrimonial.LongitudMaxima)
                .IsRequired();

            codigo.HasIndex(valor => valor.Valor)
                .IsUnique()
                .HasDatabaseName("uq_equipos_codigo_patrimonial");
        });

        constructor.Property(equipo => equipo.NombreEquipo)
            .HasColumnName("nombre_equipo")
            .HasMaxLength(Equipo.LongitudMaximaNombre)
            .IsRequired();

        constructor.Property(equipo => equipo.CategoriaEquipo)
            .HasColumnName("categoria_equipo")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        constructor.Property(equipo => equipo.MarcaEquipo)
            .HasColumnName("marca_equipo")
            .HasMaxLength(Equipo.LongitudMaximaMarca)
            .IsRequired();

        constructor.Property(equipo => equipo.EstadoEquipo)
            .HasColumnName("estado_equipo")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        constructor.HasIndex(equipo => equipo.EstadoEquipo)
            .HasDatabaseName("ix_equipos_estado");

        constructor.HasIndex(equipo => equipo.CategoriaEquipo)
            .HasDatabaseName("ix_equipos_categoria");

        constructor.HasIndex(equipo => equipo.MarcaEquipo)
            .HasDatabaseName("ix_equipos_marca");
    }
}
