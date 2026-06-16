using IdentityService.Application.Interfaces;
using IdentityService.Domain.Repositorios;
using IdentityService.Infrastructure.Outbox;
using IdentityService.Infrastructure.Persistencia;
using IdentityService.Infrastructure.Persistencia.Repositorios;
using IdentityService.Infrastructure.Servicos;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace IdentityService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(opt =>
            opt.UseNpgsql(config.GetConnectionString("DefaultConnection")));

        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<ITokenRenovacaoRepository, TokenRenovacaoRepository>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IHashService, BcryptHashService>();
        services.AddScoped<IOutboxPublisher, OutboxPublisher>();

        return services;
    }
}
