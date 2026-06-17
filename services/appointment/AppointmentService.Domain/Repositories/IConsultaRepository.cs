using AppointmentService.Domain.Entities;

namespace AppointmentService.Domain.Repositories;

public interface IConsultaRepository
{
    Task<Consulta?> ObterPorIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> SlotOcupadoAsync(Guid idMedico, DateTime agendadoPara, int duracaoMinutos, Guid? excluirId = null, CancellationToken ct = default);
    Task<IEnumerable<Consulta>> ListarPorMedicoEDataAsync(Guid idMedico, DateOnly data, CancellationToken ct = default);
    Task<(IEnumerable<Consulta> Itens, int Total)> ListarAsync(
        Guid? idMedico, Guid? idPaciente, string? status,
        DateTime? dataInicio, DateTime? dataFim,
        int pagina, int tamanhoPagina, CancellationToken ct = default);
    Task AdicionarAsync(Consulta consulta, CancellationToken ct = default);
    Task AtualizarAsync(Consulta consulta, CancellationToken ct = default);
}
