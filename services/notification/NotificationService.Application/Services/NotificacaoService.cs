using Microsoft.Extensions.Logging;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Entities;
using NotificationService.Domain.Repositories;

namespace NotificationService.Application.Services;

public class NotificacaoService(
    IPacienteServiceClient pacienteClient,
    IMedicoServiceClient medicoClient,
    IModeloNotificacaoRepository modeloRepository,
    ILogEnvioRepository logEnvioRepository,
    IEmailSender emailSender,
    IPushSender pushSender,
    ILogger<NotificacaoService> logger) : INotificacaoService
{
    public async Task ProcessarAsync(
        string tipoEvento,
        Guid idEvento,
        Guid idPaciente,
        Guid idMedico,
        DateTime agendadoPara,
        string? motivo,
        CancellationToken ct = default)
    {
        var modelos = await modeloRepository.ObterAtivosPorTipoEventoAsync(tipoEvento, ct);
        if (modelos.Count == 0)
        {
            logger.LogWarning("Nenhum modelo de notificação ativo para o evento {TipoEvento}", tipoEvento);
            return;
        }

        var paciente = await pacienteClient.ObterPorIdAsync(idPaciente, ct);
        if (paciente is null)
        {
            logger.LogWarning(
                "Paciente {IdPaciente} não encontrado, notificação do evento {TipoEvento}/{IdEvento} ignorada",
                idPaciente, tipoEvento, idEvento);
            return;
        }

        var medico = await medicoClient.ObterPorIdAsync(idMedico, ct);

        var variaveis = new Dictionary<string, string>
        {
            ["nome_paciente"] = paciente.PrimeiroNome,
            ["nome_medico"] = medico?.PrimeiroNome ?? "seu médico",
            ["data_hora"] = agendadoPara.ToString("dd/MM/yyyy HH:mm"),
            ["motivo"] = motivo ?? "não informado",
        };

        foreach (var modelo in modelos)
        {
            if (await logEnvioRepository.JaProcessadoAsync(idEvento, tipoEvento, modelo.Canal, ct))
                continue;

            await EnviarAsync(modelo, variaveis, tipoEvento, idEvento, idPaciente, paciente.Email, ct);
        }
    }

    private async Task EnviarAsync(
        ModeloNotificacao modelo,
        Dictionary<string, string> variaveis,
        string tipoEvento,
        Guid idEvento,
        Guid idPaciente,
        string? emailPaciente,
        CancellationToken ct)
    {
        var corpo = modelo.RenderizarCorpo(variaveis);
        var assunto = modelo.RenderizarAssunto(variaveis);

        LogEnvio log;
        try
        {
            if (modelo.Canal == Canal.Email)
            {
                if (string.IsNullOrWhiteSpace(emailPaciente))
                    throw new InvalidOperationException("Paciente não possui e-mail cadastrado.");

                await emailSender.EnviarAsync(emailPaciente, assunto ?? tipoEvento, corpo, ct);
            }
            else
            {
                await pushSender.EnviarAsync(idPaciente, corpo, ct);
            }

            log = LogEnvio.RegistrarSucesso(idEvento, tipoEvento, idPaciente, modelo.Canal);
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex, "Falha ao enviar notificação {TipoEvento}/{Canal} do evento {IdEvento}",
                tipoEvento, modelo.Canal, idEvento);
            log = LogEnvio.RegistrarFalha(idEvento, tipoEvento, idPaciente, modelo.Canal, ex.Message);
        }

        await logEnvioRepository.RegistrarAsync(log, ct);
    }
}
