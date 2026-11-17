using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechAsset.Infrastructure.Migraciones
{
    /// <inheritdoc />
    public partial class CrearUsuarios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    id_usuario = table.Column<Guid>(type: "uuid", nullable: false),
                    nombres_usuario = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    apellidos_usuario = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    correo_usuario = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    area_usuario = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    rol_usuario = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    activo_usuario = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    sal_contrasena_usuario = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    hash_contrasena_usuario = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_usuarios", x => x.id_usuario);
                    table.CheckConstraint("ck_usuarios_rol", "rol_usuario IN ('Administrador', 'ResponsableDeTecnologia', 'Colaborador')");
                });

            migrationBuilder.CreateIndex(
                name: "ix_usuarios_activo",
                table: "usuarios",
                column: "activo_usuario");

            migrationBuilder.CreateIndex(
                name: "ix_usuarios_rol",
                table: "usuarios",
                column: "rol_usuario");

            migrationBuilder.CreateIndex(
                name: "uq_usuarios_correo",
                table: "usuarios",
                column: "correo_usuario",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "usuarios");
        }
    }
}
