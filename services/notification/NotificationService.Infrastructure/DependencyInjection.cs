using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Repositories;
using NotificationService.Infrastructure.Email;
using NotificationService.Infrastructure.Http;
using NotificationService.Infrastructure.Kafka;
using NotificationService.Infrastructure.Persistence;
using NotificationService.Infrastructure.Persistence.Repositories;
using NotificationService.Infrastructure.Push;

namespace NotificationService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(config.GetConnectionString("DefaultConnection")));

        services.AddScoped<IModeloNotificacaoRepository, ModeloNotificacaoRepository>();
        services.AddScoped<ILogEnvioRepository, LogEnvioRepository>();

        services.Configure<HmacOptions>(config.GetSection(HmacOptions.SectionName));
        services.Configure<ServicosInternosOptions>(config.GetSection(ServicosInternosOptions.SectionName));
        services.Configure<SmtpOptions>(config.GetSection(SmtpOptions.SectionName));
        services.Configure<KafkaConsumerSettings>(config.GetSection(KafkaConsumerSettings.SectionName));

        services.AddTransient<HmacSigningHandler>();
        services.AddTransient<RetryPolicyHandler>();

        var urls = config.GetSection(ServicosInternosOptions.SectionName).Get<ServicosInternosOptions>() ?? new();

        services.AddHttpClient<IPacienteServiceClient, PacienteServiceClient>(client =>
            {
                client.BaseAddress = new Uri(urls.PatientServiceUrl);
            })
            .AddHttpMessageHandler<HmacSigningHandler>()
            .AddHttpMessageHandler<RetryPolicyHandler>();

        services.AddHttpClient<IMedicoServiceClient, MedicoServiceClient>(client =>
            {
                client.BaseAddress = new Uri(urls.IdentityServiceUrl);
            })
            .AddHttpMessageHandler<HmacSigningHandler>()
            .AddHttpMessageHandler<RetryPolicyHandler>();

        services.AddScoped<IEmailSender, SmtpEmailSender>();
        services.AddScoped<IPushSender, PushSenderStub>();

        services.AddHostedService<ConsultaEventConsumerWorker>();

        return services;
    }
}
