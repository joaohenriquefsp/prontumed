using AppointmentService.Domain.Entities;

namespace AppointmentService.Domain.Repositories;

public interface IHorarioBloqueadoRepository
{
    Task<HorarioBloqueado?> ObterPorIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<HorarioBloqueado>> ListarPorMedicoEPeriodoAsync(Guid idMedico, DateTime inicio, DateTime fim, CancellationToken ct = default);
    Task AdicionarAsync(HorarioBloqueado horario, CancellationToken ct = default);
    Task RemoverAsync(HorarioBloqueado horario, CancellationToken ct = default);
}
