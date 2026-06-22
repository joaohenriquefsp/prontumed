using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NotificationService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        // Intencionalmente vazio: o schema já é criado por
        // infra/postgres/notifications/01-schema.sql via docker-entrypoint-initdb.d.
        // Esta migration existe só para o Design-Time Model do EF reconhecer
        // o schema existente (mesmo padrão usado em Identity/Patient/Appointment/Medical Record).
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
