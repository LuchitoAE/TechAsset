using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechAsset.Infrastructure.Migraciones
{
    /// <inheritdoc />
    public partial class CrearPrestamos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "prestamos",
                columns: table => new
                {
                    id_prestamo = table.Column<Guid>(type: "uuid", nullable: false),
                    id_equipo = table.Column<Guid>(type: "uuid", nullable: false),
                    id_usuario = table.Column<Guid>(type: "uuid", nullable: false),
                    fecha_prestamo = table.Column<DateOnly>(type: "date", nullable: true),
                    fecha_devolucion = table.Column<DateOnly>(type: "date", nullable: false),
                    estado_prestamo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    fecha_devolucion_real = table.Column<DateOnly>(type: "date", nullable: true),
                    observacion_prestamo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    motivo_rechazo_prestamo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    fecha_solicitud_prestamo = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_prestamos", x => x.id_prestamo);
                    table.CheckConstraint("ck_devolucion_observacion", "estado_prestamo <> 'Devuelto' OR length(btrim(observacion_prestamo)) >= 5");
                    table.CheckConstraint("ck_prestamos_estado", "estado_prestamo IN ('Solicitado', 'Activo', 'Devuelto', 'Rechazado')");
                    table.CheckConstraint("ck_prestamos_fechas", "fecha_devolucion > fecha_prestamo");
                    table.ForeignKey(
                        name: "fk_prestamos_equipo",
                        column: x => x.id_equipo,
                        principalTable: "equipos",
                        principalColumn: "id_equipo",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_prestamos_usuario",
                        column: x => x.id_usuario,
                        principalTable: "usuarios",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_prestamos_equipo_estado",
                table: "prestamos",
                columns: new[] { "id_equipo", "estado_prestamo" });

            migrationBuilder.CreateIndex(
                name: "ix_prestamos_estado",
                table: "prestamos",
                column: "estado_prestamo");

            migrationBuilder.CreateIndex(
                name: "ix_prestamos_fecha_devolucion",
                table: "prestamos",
                column: "fecha_devolucion");

            migrationBuilder.CreateIndex(
                name: "ix_prestamos_usuario",
                table: "prestamos",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "uq_prestamos_equipo_activo",
                table: "prestamos",
                column: "id_equipo",
                unique: true,
                filter: "estado_prestamo = 'Activo'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "prestamos");
        }
    }
}
