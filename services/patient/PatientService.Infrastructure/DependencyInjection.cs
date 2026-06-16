using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PatientService.Application.Interfaces;
using PatientService.Domain.Repositorios;
using PatientService.Infrastructure.Outbox;
using PatientService.Infrastructure.Persistencia;
using PatientService.Infrastructure.Persistencia.Repositorios;

namespace PatientService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(opt =>
            opt.UseNpgsql(config.GetConnectionString("DefaultConnection")));

        services.AddScoped<IPacienteRepository, PacienteRepository>();
        services.AddScoped<IOutboxPublisher, OutboxPublisher>();

        return services;
    }
}
