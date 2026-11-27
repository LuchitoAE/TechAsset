using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechAsset.Infrastructure.Migraciones
{
    /// <inheritdoc />
    public partial class CrearMovimientos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "movimientos",
                columns: table => new
                {
                    id_movimiento = table.Column<Guid>(type: "uuid", nullable: false),
                    tipo_movimiento = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    fecha_movimiento = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    id_equipo = table.Column<Guid>(type: "uuid", nullable: false),
                    id_usuario = table.Column<Guid>(type: "uuid", nullable: false),
                    id_prestamo = table.Column<Guid>(type: "uuid", nullable: true),
                    detalle_movimiento = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_movimientos", x => x.id_movimiento);
                    table.CheckConstraint("ck_movimientos_tipo", "tipo_movimiento IN ('EquipoRegistrado', 'EquipoActualizado', 'EquipoEstadoCambiado', 'PrestamoSolicitado', 'PrestamoAprobado', 'PrestamoRechazado', 'PrestamoDevuelto')");
                    table.ForeignKey(
                        name: "fk_movimientos_equipo",
                        column: x => x.id_equipo,
                        principalTable: "equipos",
                        principalColumn: "id_equipo",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_movimientos_prestamo",
                        column: x => x.id_prestamo,
                        principalTable: "prestamos",
                        principalColumn: "id_prestamo",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_movimientos_usuario",
                        column: x => x.id_usuario,
                        principalTable: "usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_prestamos_fecha_prestamo",
                table: "prestamos",
                column: "fecha_prestamo");

            migrationBuilder.CreateIndex(
                name: "ix_equipos_marca",
                table: "equipos",
                column: "marca_equipo");

            migrationBuilder.CreateIndex(
                name: "ix_movimientos_equipo",
                table: "movimientos",
                column: "id_equipo");

            migrationBuilder.CreateIndex(
                name: "ix_movimientos_fecha",
                table: "movimientos",
                column: "fecha_movimiento");

            migrationBuilder.CreateIndex(
                name: "ix_movimientos_prestamo",
                table: "movimientos",
                column: "id_prestamo");

            migrationBuilder.CreateIndex(
                name: "ix_movimientos_tipo",
                table: "movimientos",
                column: "tipo_movimiento");

            migrationBuilder.CreateIndex(
                name: "ix_movimientos_usuario",
                table: "movimientos",
                column: "id_usuario");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "movimientos");

            migrationBuilder.DropIndex(
                name: "ix_prestamos_fecha_prestamo",
                table: "prestamos");

            migrationBuilder.DropIndex(
                name: "ix_equipos_marca",
                table: "equipos");
        }
    }
}
