using PatientService.Domain.Entidades;

namespace PatientService.Domain.Repositorios;

public interface IPacienteRepository
{
    Task<Paciente?> ObterPorIdAsync(Guid id, CancellationToken ct = default);
    Task<Paciente?> ObterPorCpfAsync(string cpf, CancellationToken ct = default);
    Task<bool> CpfJaExisteAsync(string cpf, CancellationToken ct = default);
    Task<(IEnumerable<Paciente> Itens, int Total)> ListarAsync(
        int pagina, int tamanhoPagina, string? nome, string? cpf, CancellationToken ct = default);
    Task AdicionarAsync(Paciente paciente, CancellationToken ct = default);
    Task AtualizarAsync(Paciente paciente, CancellationToken ct = default);
}
