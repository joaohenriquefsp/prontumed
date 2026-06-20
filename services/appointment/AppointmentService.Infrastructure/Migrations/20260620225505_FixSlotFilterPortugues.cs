using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppointmentService.Infrastructure.Migrations
{
    /// <inheritdoc />
    // Diferente das demais migrations deste serviço, esta é mantida funcional (não vazia):
    // corrige o filtro de idx_consultas_slot_unico para os valores de status em português
    // ('Cancelado', 'Concluido') em bancos que já tinham sido provisionados pelas migrations
    // antigas (com o filtro em inglês, nunca de fato excluindo consultas canceladas/concluídas).
    // Em um banco novo (schema criado por infra/postgres/appointments/01-schema.sql, já com o
    // filtro correto), o DropIndex+CreateIndex aqui é redundante mas inofensivo.
    public partial class FixSlotFilterPortugues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_consultas_slot_unico",
                table: "consultas");

            migrationBuilder.CreateIndex(
                name: "idx_consultas_slot_unico",
                table: "consultas",
                columns: new[] { "id_medico", "agendado_para" },
                unique: true,
                filter: "status NOT IN ('Cancelado', 'Concluido', 'NoShow')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_consultas_slot_unico",
                table: "consultas");

            migrationBuilder.CreateIndex(
                name: "idx_consultas_slot_unico",
                table: "consultas",
                columns: new[] { "id_medico", "agendado_para" },
                unique: true,
                filter: "status NOT IN ('Cancelled', 'Completed', 'NoShow')");
        }
    }
}
