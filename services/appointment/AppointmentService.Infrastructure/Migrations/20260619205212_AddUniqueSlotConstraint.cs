using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppointmentService.Infrastructure.Migrations
{
    /// <inheritdoc />
    // Migration intencionalmente vazia. O índice idx_consultas_slot_unico (anti-double-booking,
    // com filtro corrigido para os valores de status em português) agora é criado diretamente
    // por infra/postgres/appointments/01-schema.sql. Esta migration existe apenas para o
    // Design-Time Model do EF Core permanecer consistente com o histórico de migrations.
    public partial class AddUniqueSlotConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
