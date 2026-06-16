using Microsoft.EntityFrameworkCore;
using PatientService.Domain.Entidades;
using PatientService.Domain.Repositorios;

namespace PatientService.Infrastructure.Persistencia.Repositorios;

public class PacienteRepository(AppDbContext context) : IPacienteRepository
{
    public async Task<Paciente?> ObterPorIdAsync(Guid id, CancellationToken ct = default) =>
        await context.Pacientes.FindAsync([id], ct);

    public async Task<Paciente?> ObterPorCpfAsync(string cpf, CancellationToken ct = default) =>
        await context.Pacientes.FirstOrDefaultAsync(p => p.Cpf == cpf, ct);

    public async Task<bool> CpfJaExisteAsync(string cpf, CancellationToken ct = default) =>
        await context.Pacientes.AnyAsync(p => p.Cpf == cpf, ct);

    public async Task<(IEnumerable<Paciente> Itens, int Total)> ListarAsync(
        int pagina, int tamanhoPagina, string? nome, string? cpf, CancellationToken ct = default)
    {
        var query = context.Pacientes.Where(p => p.Ativo).AsQueryable();

        if (!string.IsNullOrWhiteSpace(nome))
            query = query.Where(p =>
                p.PrimeiroNome.Contains(nome) || p.Sobrenome.Contains(nome));

        if (!string.IsNullOrWhiteSpace(cpf))
            query = query.Where(p => p.Cpf == cpf);

        var total = await query.CountAsync(ct);

        var itens = await query
            .OrderBy(p => p.Sobrenome).ThenBy(p => p.PrimeiroNome)
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToListAsync(ct);

        return (itens, total);
    }

    public async Task AdicionarAsync(Paciente paciente, CancellationToken ct = default)
    {
        await context.Pacientes.AddAsync(paciente, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task AtualizarAsync(Paciente paciente, CancellationToken ct = default)
    {
        context.Pacientes.Update(paciente);
        await context.SaveChangesAsync(ct);
    }
}
