using MedicalRecordService.Application.Interfaces;
using MedicalRecordService.Domain.Repositories;
using MedicalRecordService.Infrastructure.Outbox;
using MedicalRecordService.Infrastructure.Persistence;
using MedicalRecordService.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MedicalRecordService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(opt =>
            opt.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IProntuarioRepository, ProntuarioRepository>();
        services.AddScoped<ILogAcessoRepository, LogAcessoRepository>();
        services.AddScoped<IOutboxPublisher, OutboxPublisher>();

        return services;
    }
}
