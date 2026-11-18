using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Infrastructure.Persistencia.Configuraciones;

// Traduce Movimiento a la tabla movimientos (D-03): tipo dentro del catálogo, fecha con hora en UTC,
// equipo, usuario y préstamo referenciados con ON DELETE RESTRICT, y detalle legible. Los índices
// responden a los filtros de RF-17.
public sealed class ConfiguracionDeMovimiento : IEntityTypeConfiguration<Movimiento>
{
    public void Configure(EntityTypeBuilder<Movimiento> constructor)
    {
        constructor.ToTable("movimientos", tabla =>
            tabla.HasCheckConstraint(
                "ck_movimientos_tipo",
                "tipo_movimiento IN ('EquipoRegistrado', 'EquipoActualizado', 'EquipoEstadoCambiado', " +
                "'PrestamoSolicitado', 'PrestamoAprobado', 'PrestamoRechazado', 'PrestamoDevuelto')"));

        constructor.HasKey(movimiento => movimiento.IdMovimiento).HasName("pk_movimientos");

        constructor.Property(movimiento => movimiento.IdMovimiento)
            .HasColumnName("id_movimiento");

        constructor.Property(movimiento => movimiento.TipoMovimiento)
            .HasColumnName("tipo_movimiento")
            .HasConversion<string>()
            .HasMaxLength(40)
            .IsRequired();

        constructor.Property(movimiento => movimiento.FechaMovimiento)
            .HasColumnName("fecha_movimiento")
            .IsRequired();

        constructor.Property(movimiento => movimiento.IdEquipo)
            .HasColumnName("id_equipo");

        constructor.Property(movimiento => movimiento.IdUsuario)
            .HasColumnName("id_usuario");

        constructor.Property(movimiento => movimiento.IdPrestamo)
            .HasColumnName("id_prestamo");

        constructor.Property(movimiento => movimiento.DetalleMovimiento)
            .HasColumnName("detalle_movimiento")
            .HasMaxLength(Movimiento.LongitudMaximaDetalle)
            .IsRequired();

        constructor.HasOne(movimiento => movimiento.Equipo)
            .WithMany()
            .HasForeignKey(movimiento => movimiento.IdEquipo)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("fk_movimientos_equipo");

        constructor.HasOne(movimiento => movimiento.Usuario)
            .WithMany()
            .HasForeignKey(movimiento => movimiento.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("fk_movimientos_usuario");

        constructor.HasOne<Prestamo>()
            .WithMany()
            .HasForeignKey(movimiento => movimiento.IdPrestamo)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("fk_movimientos_prestamo");

        constructor.HasIndex(movimiento => movimiento.FechaMovimiento)
            .HasDatabaseName("ix_movimientos_fecha");

        constructor.HasIndex(movimiento => movimiento.TipoMovimiento)
            .HasDatabaseName("ix_movimientos_tipo");

        constructor.HasIndex(movimiento => movimiento.IdEquipo)
            .HasDatabaseName("ix_movimientos_equipo");

        constructor.HasIndex(movimiento => movimiento.IdUsuario)
            .HasDatabaseName("ix_movimientos_usuario");

        constructor.HasIndex(movimiento => movimiento.IdPrestamo)
            .HasDatabaseName("ix_movimientos_prestamo");
    }
}
