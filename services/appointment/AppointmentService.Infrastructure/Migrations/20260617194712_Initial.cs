using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppointmentService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "consultas",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    id_paciente = table.Column<Guid>(type: "uuid", nullable: false),
                    id_medico = table.Column<Guid>(type: "uuid", nullable: false),
                    agendado_para = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    duracao_minutos = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    motivo_cancelamento = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    observacoes = table.Column<string>(type: "text", nullable: true),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    atualizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_consultas", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "estado_saga",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    id_correlacao = table.Column<Guid>(type: "uuid", nullable: false),
                    tipo_saga = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    etapa_atual = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    payload = table.Column<string>(type: "jsonb", nullable: false),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    atualizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_estado_saga", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "eventos_saida",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tipo_agregado = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    id_agregado = table.Column<Guid>(type: "uuid", nullable: false),
                    tipo_evento = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    payload = table.Column<string>(type: "jsonb", nullable: false),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_eventos_saida", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "grade_horarios",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    id_medico = table.Column<Guid>(type: "uuid", nullable: false),
                    dia_semana = table.Column<int>(type: "integer", nullable: false),
                    horario_inicio = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    horario_fim = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    duracao_slot_minutos = table.Column<int>(type: "integer", nullable: false),
                    ativo = table.Column<bool>(type: "boolean", nullable: false),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_grade_horarios", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "horarios_bloqueados",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    id_medico = table.Column<Guid>(type: "uuid", nullable: false),
                    inicio_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    fim_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    motivo = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_horarios_bloqueados", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_consultas_id_medico_agendado_para",
                table: "consultas",
                columns: new[] { "id_medico", "agendado_para" });

            migrationBuilder.CreateIndex(
                name: "IX_consultas_id_paciente",
                table: "consultas",
                column: "id_paciente");

            migrationBuilder.CreateIndex(
                name: "IX_estado_saga_id_correlacao",
                table: "estado_saga",
                column: "id_correlacao",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_grade_horarios_id_medico_dia_semana",
                table: "grade_horarios",
                columns: new[] { "id_medico", "dia_semana" });

            migrationBuilder.CreateIndex(
                name: "IX_horarios_bloqueados_id_medico_inicio_em",
                table: "horarios_bloqueados",
                columns: new[] { "id_medico", "inicio_em" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "consultas");

            migrationBuilder.DropTable(
                name: "estado_saga");

            migrationBuilder.DropTable(
                name: "eventos_saida");

            migrationBuilder.DropTable(
                name: "grade_horarios");

            migrationBuilder.DropTable(
                name: "horarios_bloqueados");
        }
    }
}
