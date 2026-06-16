using Microsoft.EntityFrameworkCore;
using PatientService.Domain.Entities;
using PatientService.Infrastructure.Outbox;

namespace PatientService.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Paciente> Pacientes => Set<Paciente>();
    public DbSet<EventoSaida> EventosSaida => Set<EventoSaida>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
