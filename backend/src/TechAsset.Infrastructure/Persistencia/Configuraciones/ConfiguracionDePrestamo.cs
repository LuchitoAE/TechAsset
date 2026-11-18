using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Infrastructure.Persistencia.Configuraciones;

// Traduce Prestamo a la tabla prestamos con columnas snake_case y las restricciones del SDD:
// estado dentro del catálogo, fechas coherentes (RN-04), observación obligatoria al devolver
// (RN-10), un solo préstamo activo por equipo (RN-01) y claves foráneas que impiden borrar un
// equipo o un usuario con historial (RN-06).
public sealed class ConfiguracionDePrestamo : IEntityTypeConfiguration<Prestamo>
{
    public void Configure(EntityTypeBuilder<Prestamo> constructor)
    {
        constructor.ToTable("prestamos", tabla =>
        {
            tabla.HasCheckConstraint(
                "ck_prestamos_estado",
                "estado_prestamo IN ('Solicitado', 'Activo', 'Devuelto', 'Rechazado')");

            // RN-04: fecha_devolucion > fecha_prestamo. Mientras está Solicitado la fecha de préstamo
            // es nula y el CHECK se cumple; al aprobar se fija y se vuelve a validar.
            tabla.HasCheckConstraint(
                "ck_prestamos_fechas",
                "fecha_devolucion > fecha_prestamo");

            // RN-10: un préstamo Devuelto debe tener observaciones.
            tabla.HasCheckConstraint(
                "ck_devolucion_observacion",
                "estado_prestamo <> 'Devuelto' OR length(btrim(observacion_prestamo)) >= 5");
        });

        constructor.HasKey(prestamo => prestamo.IdPrestamo).HasName("pk_prestamos");

        constructor.Property(prestamo => prestamo.IdPrestamo)
            .HasColumnName("id_prestamo");

        constructor.Property(prestamo => prestamo.IdEquipo)
            .HasColumnName("id_equipo");

        constructor.Property(prestamo => prestamo.IdUsuario)
            .HasColumnName("id_usuario");

        // La fecha de préstamo es la de la aprobación (D-04); la de devolución, la comprometida.
        constructor.OwnsOne(prestamo => prestamo.Periodo, periodo =>
        {
            periodo.Property(valor => valor.FechaPrestamo)
                .HasColumnName("fecha_prestamo");

            periodo.Property(valor => valor.FechaDevolucionPrestamo)
                .HasColumnName("fecha_devolucion")
                .IsRequired();

            periodo.HasIndex(valor => valor.FechaDevolucionPrestamo)
                .HasDatabaseName("ix_prestamos_fecha_devolucion");
        });

        constructor.Property(prestamo => prestamo.EstadoPrestamo)
            .HasColumnName("estado_prestamo")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        constructor.Property(prestamo => prestamo.FechaDevolucionRealPrestamo)
            .HasColumnName("fecha_devolucion_real");

        constructor.Property(prestamo => prestamo.ObservacionPrestamo)
            .HasColumnName("observacion_prestamo")
            .HasMaxLength(Prestamo.LongitudMaximaObservacion);

        constructor.Property(prestamo => prestamo.MotivoRechazoPrestamo)
            .HasColumnName("motivo_rechazo_prestamo")
            .HasMaxLength(Prestamo.LongitudMaximaMotivo);

        constructor.Property(prestamo => prestamo.FechaSolicitudPrestamo)
            .HasColumnName("fecha_solicitud_prestamo")
            .IsRequired();

        constructor.HasOne(prestamo => prestamo.Equipo)
            .WithMany()
            .HasForeignKey(prestamo => prestamo.IdEquipo)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("fk_prestamos_equipo");

        constructor.HasOne(prestamo => prestamo.Responsable)
            .WithMany()
            .HasForeignKey(prestamo => prestamo.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("fk_prestamos_usuario");

        // RN-01: índice único parcial. La base impide dos préstamos activos del mismo equipo aunque
        // dos aprobaciones lleguen a la vez.
        constructor.HasIndex(prestamo => prestamo.IdEquipo)
            .IsUnique()
            .HasFilter("estado_prestamo = 'Activo'")
            .HasDatabaseName("uq_prestamos_equipo_activo");

        constructor.HasIndex(prestamo => new { prestamo.IdEquipo, prestamo.EstadoPrestamo })
            .HasDatabaseName("ix_prestamos_equipo_estado");

        constructor.HasIndex(prestamo => prestamo.IdUsuario)
            .HasDatabaseName("ix_prestamos_usuario");

        constructor.HasIndex(prestamo => prestamo.EstadoPrestamo)
            .HasDatabaseName("ix_prestamos_estado");
    }
}
