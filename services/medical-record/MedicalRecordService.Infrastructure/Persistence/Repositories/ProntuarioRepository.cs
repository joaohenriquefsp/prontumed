using MedicalRecordService.Domain.Entities;
using MedicalRecordService.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace MedicalRecordService.Infrastructure.Persistence.Repositories;

public class ProntuarioRepository(AppDbContext context) : IProntuarioRepository
{
    public async Task<Prontuario?> ObterPorIdPacienteAsync(Guid idPaciente, CancellationToken ct = default)
    {
        var historico = await context.EventosArmazenados
            .Where(e => e.IdAgregado == idPaciente)
            .OrderBy(e => e.Versao)
            .ToListAsync(ct);

        return historico.Count == 0 ? null : Prontuario.ReplayEventos(idPaciente, historico);
    }

    public async Task<bool> ExisteAsync(Guid idPaciente, CancellationToken ct = default)
        => await context.EventosArmazenados.AnyAsync(e => e.IdAgregado == idPaciente, ct);

    public async Task<EntradaProntuario?> ObterEntradaAsync(Guid idPaciente, Guid idEntrada, CancellationToken ct = default)
    {
        var prontuario = await ObterPorIdPacienteAsync(idPaciente, ct);
        return prontuario?.Entradas.FirstOrDefault(e => e.Id == idEntrada);
    }

    public async Task<IReadOnlyList<EventoArmazenado>> ObterHistoricoAsync(Guid idPaciente, CancellationToken ct = default)
        => await context.EventosArmazenados
            .Where(e => e.IdAgregado == idPaciente)
            .OrderBy(e => e.Versao)
            .ToListAsync(ct);

    public async Task AdicionarAsync(Prontuario prontuario, CancellationToken ct = default)
    {
        var versao = await context.EventosArmazenados
            .Where(e => e.IdAgregado == prontuario.Id)
            .Select(e => (int?)e.Versao)
            .MaxAsync(ct) ?? 0;

        foreach (var evento in prontuario.Eventos)
        {
            versao++;
            await context.EventosArmazenados.AddAsync(new EventoArmazenado
            {
                Id = Guid.NewGuid(),
                IdAgregado = prontuario.Id,
                TipoAgregado = "MedicalRecord",
                TipoEvento = evento.GetType().Name,
                Versao = versao,
                Payload = System.Text.Json.JsonSerializer.Serialize(evento, evento.GetType()),
                OcorreuEm = DateTime.UtcNow
            }, ct);
        }
        // Sem SaveChangesAsync aqui — o OutboxPublisher faz o único SaveChangesAsync,
        // gravando estas linhas e as de eventos_saida na mesma transação.
    }
}
