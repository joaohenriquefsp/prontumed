namespace NotificationService.Application.Interfaces;

public interface INotificacaoService
{
    // idEvento aqui é o id_agregado do evento de origem (= IdConsulta).
    Task ProcessarAsync(
        string tipoEvento,
        Guid idEvento,
        Guid idPaciente,
        Guid idMedico,
        DateTime agendadoPara,
        string? motivo,
        CancellationToken ct = default);
}
