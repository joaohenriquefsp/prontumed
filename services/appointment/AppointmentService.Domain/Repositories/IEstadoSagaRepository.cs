using AppointmentService.Domain.Entities;

namespace AppointmentService.Domain.Repositories;

public interface IEstadoSagaRepository
{
    Task<EstadoSaga?> ObterPorCorrelacaoAsync(Guid idCorrelacao, CancellationToken ct = default);
    Task AdicionarAsync(EstadoSaga estado, CancellationToken ct = default);
    Task AtualizarAsync(EstadoSaga estado, CancellationToken ct = default);
}
