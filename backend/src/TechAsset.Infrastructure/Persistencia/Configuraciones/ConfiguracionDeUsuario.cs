using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechAsset.Domain.Comun;
using TechAsset.Domain.Entidades;
using TechAsset.Domain.Enumeraciones;

namespace TechAsset.Infrastructure.Persistencia.Configuraciones;

// Traduce Usuario a la tabla usuarios con columnas snake_case y las restricciones del SDD:
// correo único (RN-08) y rol dentro del catálogo.
public sealed class ConfiguracionDeUsuario : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> constructor)
    {
        constructor.ToTable("usuarios", tabla =>
            tabla.HasCheckConstraint(
                "ck_usuarios_rol",
                "rol_usuario IN ('Administrador', 'ResponsableDeTecnologia', 'Colaborador')"));

        constructor.HasKey(usuario => usuario.IdUsuario).HasName("pk_usuarios");

        constructor.Property(usuario => usuario.IdUsuario)
            .HasColumnName("id_usuario");

        constructor.Property(usuario => usuario.NombresUsuario)
            .HasColumnName("nombres_usuario")
            .HasMaxLength(Usuario.LongitudMaximaNombre)
            .IsRequired();

        constructor.Property(usuario => usuario.ApellidosUsuario)
            .HasColumnName("apellidos_usuario")
            .HasMaxLength(Usuario.LongitudMaximaNombre)
            .IsRequired();

        constructor.OwnsOne(usuario => usuario.CorreoUsuario, correo =>
        {
            correo.Property(valor => valor.Valor)
                .HasColumnName("correo_usuario")
                .HasMaxLength(CorreoElectronico.LongitudMaxima)
                .IsRequired();

            correo.HasIndex(valor => valor.Valor)
                .IsUnique()
                .HasDatabaseName("uq_usuarios_correo");
        });

        constructor.Property(usuario => usuario.AreaUsuario)
            .HasColumnName("area_usuario")
            .HasMaxLength(Usuario.LongitudMaximaArea)
            .IsRequired();

        constructor.Property(usuario => usuario.RolUsuario)
            .HasColumnName("rol_usuario")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        constructor.Property(usuario => usuario.ActivoUsuario)
            .HasColumnName("activo_usuario")
            .HasDefaultValue(true)
            .IsRequired();

        constructor.Property(usuario => usuario.SalContrasenaUsuario)
            .HasColumnName("sal_contrasena_usuario")
            .HasMaxLength(64)
            .IsRequired();

        constructor.Property(usuario => usuario.HashContrasenaUsuario)
            .HasColumnName("hash_contrasena_usuario")
            .HasMaxLength(200)
            .IsRequired();

        constructor.HasIndex(usuario => usuario.RolUsuario)
            .HasDatabaseName("ix_usuarios_rol");

        constructor.HasIndex(usuario => usuario.ActivoUsuario)
            .HasDatabaseName("ix_usuarios_activo");
    }
}
