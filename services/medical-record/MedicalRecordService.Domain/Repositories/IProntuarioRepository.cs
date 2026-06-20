using MedicalRecordService.Domain.Entities;

namespace MedicalRecordService.Domain.Repositories;

public interface IProntuarioRepository
{
    Task<Prontuario?> ObterPorIdPacienteAsync(Guid idPaciente, CancellationToken ct = default);
    Task<bool> ExisteAsync(Guid idPaciente, CancellationToken ct = default);
    Task<EntradaProntuario?> ObterEntradaAsync(Guid idPaciente, Guid idEntrada, CancellationToken ct = default);
    Task<IReadOnlyList<EventoArmazenado>> ObterHistoricoAsync(Guid idPaciente, CancellationToken ct = default);
    Task AdicionarAsync(Prontuario prontuario, CancellationToken ct = default);
}
