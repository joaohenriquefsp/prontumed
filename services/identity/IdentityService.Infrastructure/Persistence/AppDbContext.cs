using IdentityService.Domain.Entities;
using IdentityService.Infrastructure.Outbox;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<TokenRenovacao> TokensRenovacao => Set<TokenRenovacao>();
    public DbSet<EventoSaida> EventosSaida => Set<EventoSaida>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
