using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PatientService.Infrastructure.Migrations
{
    /// <inheritdoc />
    // Migration intencionalmente vazia. O schema deste banco (pacientes, eventos_saida) é
    // gerenciado por infra/postgres/patients/01-schema.sql, executado pelo Postgres via
    // docker-entrypoint-initdb.d antes de qualquer migration do EF. Esta migration existe
    // apenas para o Design-Time Model do EF Core reconhecer o schema já existente —
    // "dotnet ef database update" nunca recria essas tabelas.
    public partial class InitialCreate : Migration
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
