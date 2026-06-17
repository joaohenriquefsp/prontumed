using AppointmentService.Domain.Entities;
using AppointmentService.Domain.Repositories;
using AppointmentService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppointmentService.Infrastructure.Persistence.Repositories;

public class EstadoSagaRepository(AppDbContext context) : IEstadoSagaRepository
{
    public async Task<EstadoSaga?> ObterPorCorrelacaoAsync(Guid idCorrelacao, CancellationToken ct = default)
        => await context.EstadosSaga.FirstOrDefaultAsync(e => e.IdCorrelacao == idCorrelacao, ct);

    public async Task AdicionarAsync(EstadoSaga estado, CancellationToken ct = default)
        => await context.EstadosSaga.AddAsync(estado, ct);

    public Task AtualizarAsync(EstadoSaga estado, CancellationToken ct = default)
    {
        context.EstadosSaga.Update(estado);
        return Task.CompletedTask;
    }
}
