using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppointmentService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueSlotConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_consultas_id_medico_agendado_para",
                table: "consultas");

            migrationBuilder.CreateIndex(
                name: "idx_consultas_slot_unico",
                table: "consultas",
                columns: new[] { "id_medico", "agendado_para" },
                unique: true,
                filter: "status NOT IN ('Cancelled', 'Completed', 'NoShow')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_consultas_slot_unico",
                table: "consultas");

            migrationBuilder.CreateIndex(
                name: "IX_consultas_id_medico_agendado_para",
                table: "consultas",
                columns: new[] { "id_medico", "agendado_para" });
        }
    }
}
