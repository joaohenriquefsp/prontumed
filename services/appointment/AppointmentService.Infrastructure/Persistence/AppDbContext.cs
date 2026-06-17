using AppointmentService.Domain.Entities;
using AppointmentService.Infrastructure.Outbox;
using Microsoft.EntityFrameworkCore;

namespace AppointmentService.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Consulta> Consultas => Set<Consulta>();
    public DbSet<GradeHorario> GradeHorarios => Set<GradeHorario>();
    public DbSet<HorarioBloqueado> HorariosBloqueados => Set<HorarioBloqueado>();
    public DbSet<EstadoSaga> EstadosSaga => Set<EstadoSaga>();
    public DbSet<EventoSaida> EventosSaida => Set<EventoSaida>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
        => modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
}
