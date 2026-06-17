using AppointmentService.Application.Interfaces;
using AppointmentService.Domain.Repositories;
using AppointmentService.Infrastructure.Outbox;
using AppointmentService.Infrastructure.Persistence;
using AppointmentService.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AppointmentService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(opt =>
            opt.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IConsultaRepository, ConsultaRepository>();
        services.AddScoped<IGradeHorarioRepository, GradeHorarioRepository>();
        services.AddScoped<IHorarioBloqueadoRepository, HorarioBloqueadoRepository>();
        services.AddScoped<IEstadoSagaRepository, EstadoSagaRepository>();
        services.AddScoped<IOutboxPublisher, OutboxPublisher>();

        return services;
    }
}
