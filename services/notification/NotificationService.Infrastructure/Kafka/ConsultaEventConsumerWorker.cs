using System.Text;
using System.Text.Json;
using Confluent.Kafka;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NotificationService.Application.Commands.ProcessarConsultaAgendada;
using NotificationService.Application.Commands.ProcessarConsultaCancelada;
using NotificationService.Application.Commands.ProcessarConsultaConcluida;
using NotificationService.Domain.Entities;
using NotificationService.Infrastructure.Kafka.Payloads;

namespace NotificationService.Infrastructure.Kafka;

// Único consumidor Kafka do sistema — o Notification Service nunca produz
// eventos de domínio, apenas reage aos do Appointment Service.
public class ConsultaEventConsumerWorker(
    IOptions<KafkaConsumerSettings> options,
    IServiceScopeFactory scopeFactory,
    ILogger<ConsultaEventConsumerWorker> logger) : BackgroundService
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var settings = options.Value;
        var config = new ConsumerConfig
        {
            BootstrapServers = settings.BootstrapServers,
            GroupId = settings.GroupId,
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = false,
        };

        logger.LogInformation("Bootstrap: '{Bootstrap}' | Tópico: {Topico} | Grupo: {GroupId}",
            settings.BootstrapServers, settings.TopicoConsultas, settings.GroupId);

        using var consumer = new ConsumerBuilder<string, string>(config).Build();
        consumer.Subscribe(settings.TopicoConsultas);

        logger.LogInformation("Consumer criado. Aguardando mensagens...");

        while (!stoppingToken.IsCancellationRequested)
        {
            ConsumeResult<string, string>? resultado;
            try
            {
                resultado = consumer.Consume(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (ConsumeException ex)
            {
                logger.LogError(ex, "Erro ao consumir mensagem do Kafka");
                continue;
            }

            try
            {
                await ProcessarMensagemAsync(resultado, stoppingToken);
                consumer.Commit(resultado);
            }
            catch (Exception ex)
            {
                logger.LogError(
                    ex, "Falha ao processar evento no offset {Offset}, será reprocessado na próxima execução",
                    resultado.Offset);
            }
        }

        consumer.Close();
    }

    private async Task ProcessarMensagemAsync(ConsumeResult<string, string> resultado, CancellationToken ct)
    {
        var tipoEvento = ExtrairTipoEvento(resultado.Message.Headers);
        if (tipoEvento is null)
        {
            logger.LogWarning("Mensagem sem header eventType, ignorada (offset {Offset})", resultado.Offset);
            return;
        }

        if (!Guid.TryParse(resultado.Message.Key, out var idAgregado))
        {
            logger.LogWarning("Mensagem com chave inválida ({Key}), ignorada", resultado.Message.Key);
            return;
        }

        IRequest? comando = tipoEvento switch
        {
            TipoEvento.ConsultaAgendada => ConverterAgendada(idAgregado, resultado.Message.Value),
            TipoEvento.ConsultaCancelada => ConverterCancelada(idAgregado, resultado.Message.Value),
            TipoEvento.ConsultaConcluida => ConverterConcluida(idAgregado, resultado.Message.Value),
            _ => null,
        };

        if (comando is null)
            return;

        using var scope = scopeFactory.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
        await mediator.Send(comando, ct);
    }

    private static string? ExtrairTipoEvento(Headers headers) =>
        headers.FirstOrDefault(h => h.Key == "eventType") is { } header
            ? Encoding.UTF8.GetString(header.GetValueBytes())
            : null;

    private static IRequest ConverterAgendada(Guid idAgregado, string payloadJson)
    {
        var payload = JsonSerializer.Deserialize<ConsultaAgendadaPayload>(payloadJson, JsonOptions)!;
        return new ProcessarConsultaAgendadaCommand(idAgregado, payload.IdConsulta, payload.IdPaciente, payload.IdMedico, payload.AgendadoPara, payload.DuracaoMinutos);
    }

    private static IRequest ConverterCancelada(Guid idAgregado, string payloadJson)
    {
        var payload = JsonSerializer.Deserialize<ConsultaCanceladaPayload>(payloadJson, JsonOptions)!;
        return new ProcessarConsultaCanceladaCommand(idAgregado, payload.IdConsulta, payload.IdPaciente, payload.IdMedico, payload.AgendadoPara, payload.Motivo);
    }

    private static IRequest ConverterConcluida(Guid idAgregado, string payloadJson)
    {
        var payload = JsonSerializer.Deserialize<ConsultaConcluidaPayload>(payloadJson, JsonOptions)!;
        return new ProcessarConsultaConcluidaCommand(idAgregado, payload.IdConsulta, payload.IdPaciente, payload.IdMedico, payload.AgendadoPara);
    }
}
