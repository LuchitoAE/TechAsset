using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechAsset.Infrastructure.Migraciones
{
    /// <inheritdoc />
    public partial class CrearEquipos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "equipos",
                columns: table => new
                {
                    id_equipo = table.Column<Guid>(type: "uuid", nullable: false),
                    codigo_patrimonial_equipo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    nombre_equipo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    categoria_equipo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    marca_equipo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    estado_equipo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_equipos", x => x.id_equipo);
                    table.CheckConstraint("ck_equipos_estado", "estado_equipo IN ('Disponible', 'Prestado', 'Mantenimiento', 'Baja')");
                });

            migrationBuilder.CreateIndex(
                name: "ix_equipos_categoria",
                table: "equipos",
                column: "categoria_equipo");

            migrationBuilder.CreateIndex(
                name: "ix_equipos_estado",
                table: "equipos",
                column: "estado_equipo");

            migrationBuilder.CreateIndex(
                name: "uq_equipos_codigo_patrimonial",
                table: "equipos",
                column: "codigo_patrimonial_equipo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "equipos");
        }
    }
}
