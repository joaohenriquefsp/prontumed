using MedicalRecordService.Domain.Entities;
using MedicalRecordService.Infrastructure.Outbox;
using Microsoft.EntityFrameworkCore;

namespace MedicalRecordService.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<EventoArmazenado> EventosArmazenados => Set<EventoArmazenado>();
    public DbSet<LogAcessoProntuario> LogsAcesso => Set<LogAcessoProntuario>();
    public DbSet<EventoSaida> EventosSaida => Set<EventoSaida>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
        => modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
}
