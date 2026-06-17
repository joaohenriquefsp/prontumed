using AppointmentService.Domain.Entities;
using AppointmentService.Domain.Repositories;
using AppointmentService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppointmentService.Infrastructure.Persistence.Repositories;

public class ConsultaRepository(AppDbContext context) : IConsultaRepository
{
    public async Task<Consulta?> ObterPorIdAsync(Guid id, CancellationToken ct = default)
        => await context.Consultas.FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<bool> SlotOcupadoAsync(Guid idMedico, DateTime agendadoPara, int duracaoMinutos, Guid? excluirId = null, CancellationToken ct = default)
    {
        var slotFim = agendadoPara.AddMinutes(duracaoMinutos);
        return await context.Consultas.AnyAsync(c =>
            c.IdMedico == idMedico &&
            c.Status != StatusConsulta.Cancelado &&
            c.Status != StatusConsulta.NoShow &&
            (excluirId == null || c.Id != excluirId) &&
            c.AgendadoPara < slotFim &&
            c.AgendadoPara.AddMinutes(c.DuracaoMinutos) > agendadoPara, ct);
    }

    public async Task<IEnumerable<Consulta>> ListarPorMedicoEDataAsync(Guid idMedico, DateOnly data, CancellationToken ct = default)
    {
        var inicio = new DateTime(data.Year, data.Month, data.Day, 0, 0, 0, DateTimeKind.Utc);
        var fim = inicio.AddDays(1);
        return await context.Consultas
            .Where(c => c.IdMedico == idMedico &&
                        c.Status != StatusConsulta.Cancelado &&
                        c.Status != StatusConsulta.NoShow &&
                        c.AgendadoPara >= inicio && c.AgendadoPara < fim)
            .ToListAsync(ct);
    }

    public async Task<(IEnumerable<Consulta> Itens, int Total)> ListarAsync(
        Guid? idMedico, Guid? idPaciente, string? status,
        DateTime? dataInicio, DateTime? dataFim,
        int pagina, int tamanhoPagina, CancellationToken ct = default)
    {
        var query = context.Consultas.AsQueryable();
        if (idMedico.HasValue) query = query.Where(c => c.IdMedico == idMedico.Value);
        if (idPaciente.HasValue) query = query.Where(c => c.IdPaciente == idPaciente.Value);
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(c => c.Status == status);
        if (dataInicio.HasValue) query = query.Where(c => c.AgendadoPara >= dataInicio.Value);
        if (dataFim.HasValue) query = query.Where(c => c.AgendadoPara <= dataFim.Value);

        var total = await query.CountAsync(ct);
        var itens = await query
            .OrderBy(c => c.AgendadoPara)
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToListAsync(ct);

        return (itens, total);
    }

    public async Task AdicionarAsync(Consulta consulta, CancellationToken ct = default)
        => await context.Consultas.AddAsync(consulta, ct);

    public Task AtualizarAsync(Consulta consulta, CancellationToken ct = default)
    {
        context.Consultas.Update(consulta);
        return Task.CompletedTask;
    }
}
