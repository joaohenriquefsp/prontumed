using AppointmentService.Domain.Entities;

namespace AppointmentService.Domain.Repositories;

public interface IGradeHorarioRepository
{
    Task<GradeHorario?> ObterPorIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<GradeHorario>> ListarPorMedicoAsync(Guid idMedico, CancellationToken ct = default);
    Task<IEnumerable<GradeHorario>> ListarPorMedicoEDiaAsync(Guid idMedico, int diaSemana, CancellationToken ct = default);
    Task AdicionarAsync(GradeHorario grade, CancellationToken ct = default);
    Task RemoverAsync(GradeHorario grade, CancellationToken ct = default);
}
